import { Request, Response, NextFunction } from 'express';
import User from '../models/UserModel';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import path from 'path';
import { OAuth2Client, LoginTicket } from 'google-auth-library';

dotenv.config({ path: path.resolve(__dirname, '../.env') });
const CLIENT_ID = '576373601322-gc96v6m3gaeqsu7an85a5cqjmceve5lo.apps.googleusercontent.com';
const client = new OAuth2Client(CLIENT_ID);

export const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      res.status(400).json({ message: 'Name, email, and password are required.' });
      return;
    }

    const existingUser = await User.findOne({ where: { email } });

    if (existingUser) {
      res.status(400).json({ message: 'User with this email already exists.' });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      role: 'user',
      name,
      email,
      password: hashedPassword,
      hourlyRate: 0,
      bio: '',
    });

    const token = jwt.sign({ userId: newUser.id }, 'your_secret_key', {
      expiresIn: '1h',
    });

    res
      .cookie('authToken', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 3600000,
      })
      .status(201)
      .json({
        message: 'User registered successfully.',
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          hourlyRate: newUser.hourlyRate,
          bio: newUser.bio,
        },
      });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Internal server error.' });
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ message: 'Email and password are required.' });
      return;
    }

    const user = await User.findOne({ where: { email } });

    if (!user) {
      res.status(401).json({ message: 'Invalid email or password.' });
      return;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      res.status(401).json({ message: 'Invalid email or password.' });
      return;
    }

    const token = jwt.sign({ userId: user.id }, 'your_secret_key' as string, {
      expiresIn: '1h',
    });

    res
      .cookie('authToken', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 3600000,
      })
      .status(200)
      .json({
        message: 'Login successful.',
        user: {
          id: user.id,
          role: user.role,
          name: user.name,
          email: user.email,
          hourlyRate: user.hourlyRate,
          bio: user.bio,
        },
      });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error.' });
    next(error);
  }
};

// Google Auth
async function verifyGoogleToken(idToken: string) {
  try {
    const ticket: LoginTicket = await client.verifyIdToken({
      idToken: idToken,
      audience: CLIENT_ID,
    });

    const payload = ticket.getPayload();

    if (!payload) {
      console.error('Google token payload boş veya tanımsız.');
      return null;
    }

    const userId = payload.sub;
    const email = payload.email;
    const name = payload.name;
    const picture = payload.picture;
    const emailVerified = payload.email_verified;

    return { userId, email, name, picture, emailVerified, payload };
  } catch (error) {
    console.error('Google token doğrulama hatası:', error);
    return null;
  }
}

export const googleLogin = async (req: Request, res: Response): Promise<void> => {
  const { idToken } = req.body;

  if (!idToken) {
    res.status(400).json({ message: "Token didn\'t find." });
    return;
  }

  const userInfo = await verifyGoogleToken(idToken);

  if (userInfo) {
    try {
      let user = await User.findOne({ where: { email: userInfo.email } });

      if (!user) {
        const defaultPassword = 'GooglePassword' + Math.random().toString(36).substring(7);
        const hashedPassword = await bcrypt.hash(defaultPassword, 10);

        user = await User.create({
          role: 'user',
          name: userInfo.name || userInfo.email?.split('@')[0] || '',
          email: userInfo.email || '',
          password: hashedPassword,
          profilePicture: userInfo.picture || '',
          googleId: userInfo.userId,
          bio: '',
          hourlyRate: 0.0,
        });
      }

      const token = jwt.sign({ id: user.id }, 'your_secret_key', { expiresIn: '1h' });

      res
        .cookie('authToken', token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          maxAge: 3600000,
        })
        .status(200)
        .json({
          success: true,
          message: 'Login successful.',
          user: {
            id: user.id,
            role: user.role,
            name: user.name,
            email: user.email,
            hourlyRate: user.hourlyRate,
            bio: user.bio,
          },
        });
    } catch (error) {
      console.error('Google auth login error:', error);
      res.status(500).json({ message: 'Server Internal Error' });
    }
  } else {
    res.status(401).json({ message: 'Google authentication fail. Invalid token!' });
  }
};

export const logout = (req: Request, res: Response) => {
  res.status(200).json({ message: 'Logout successful.' });
};

export const getCurrentUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = req.user;

    if (!user) {
      res.status(404).json({ message: 'User not found.' });
      return;
    }

    res.status(200).json({
      id: user.id,
      role: user.role,
      name: user.name,
      email: user.email,
      hourlyRate: user.hourlyRate,
      bio: user.bio,
    });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

export const updateUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { name, email, hourlyRate, bio } = req.body;

    if (!userId) {
      res.status(401).json({ message: 'Unauthorized.' });
    }

    const user = await User.findByPk(userId);

    if (!user) {
      res.status(404).json({ message: 'User not found.' });
      return;
    }

    await user.update({
      name: name || user.name,
      email: email || user.email,
      hourlyRate: hourlyRate || user.hourlyRate,
      bio: bio || user.bio,
    });

    res.status(200).json({
      message: 'User updated successfully.',
      user: {
        id: user.id,
        role: user.role,
        name: user.name,
        email: user.email,
        hourlyRate: user.hourlyRate,
        bio: user.bio,
      },
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

export const deleteUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ message: 'Unauthorized.' });
      return;
    }

    const user = await User.findByPk(userId);

    if (!user) {
      res.status(404).json({ message: 'User not found.' });
      return;
    }

    await user.destroy();

    res.status(200).json({ message: 'User deleted successfully.' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

//? Admin-only routes

export const getAllUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const users = await User.findAll({
      attributes: ['id', 'role', 'name', 'email', 'hourlyRate', 'bio'],
    });

    res.status(200).json(users);
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

export const getUserById = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.params.id;

    const user = await User.findByPk(userId, {
      attributes: ['id', 'role', 'name', 'email', 'hourlyRate', 'bio'],
    });

    if (!user) {
      res.status(404).json({ message: 'User not found.' });
      return;
    }

    res.status(200).json(user);
  } catch (error) {
    console.error('Get user by ID error:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

export const updateUserRole = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.params.id;
    const { role } = req.body;

    if (!role || !['admin', 'user'].includes(role)) {
      res.status(400).json({ message: 'Invalid role.' });
      return;
    }

    const user = await User.findByPk(userId);

    if (!user) {
      res.status(404).json({ message: 'User not found.' });
      return;
    }

    await user.update({ role });

    res.status(200).json({
      message: 'User role updated successfully.',
      user: {
        id: user.id,
        role: user.role,
        name: user.name,
        email: user.email,
        hourlyRate: user.hourlyRate,
        bio: user.bio,
      },
    });
  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

export const deleteUserById = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.params.id;

    const user = await User.findByPk(userId);

    if (!user) {
      res.status(404).json({ message: 'User not found.' });
      return;
    }

    await user.destroy();

    res.status(200).json({ message: 'User deleted successfully.' });
  } catch (error) {
    console.error('Delete user by ID error:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};
