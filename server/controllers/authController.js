import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { registerSchema, loginSchema } from '../validators/authValidator.js';

const COOKIE_NAME = 'token';

const getCookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
});

export const register = async (req, res, next) => {
  try {
    // 1. Validate payload
    const validatedData = registerSchema.parse(req.body);

    // 2. Normalize email
    const normalizedEmail = validatedData.email.toLowerCase().trim();

    // 3. Duplicate check
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email address already exists.'
      });
    }

    // 4. Force CUSTOMER role - strictly ignore any client role tampering
    const user = new User({
      name: validatedData.name.trim(),
      email: normalizedEmail,
      password: validatedData.password,
      role: 'CUSTOMER'
    });

    await user.save();

    return res.status(201).json({
      success: true,
      message: 'Registration successful! You may now log in.',
      user: user.toSafeObject()
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const validatedData = loginSchema.parse(req.body);
    const normalizedEmail = validatedData.email.toLowerCase().trim();

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const isMatch = await user.comparePassword(validatedData.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Role-based gate: If user specifically attempts to log in as administrator, verify role
    if (validatedData.expectedRole === 'ADMIN' && user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'This account does not have administrator access. Please use Customer Login.'
      });
    }

    const secret = process.env.JWT_SECRET || 'super_secret_art_studio_jwt_token_key_change_in_production_2026';
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      secret,
      { expiresIn: '7d' }
    );

    res.cookie(COOKIE_NAME, token, getCookieOptions());

    return res.status(200).json({
      success: true,
      message: 'Logged in successfully',
      user: user.toSafeObject()
    });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req, res, next) => {
  try {
    res.clearCookie(COOKIE_NAME, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    });
    return res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated'
      });
    }
    return res.status(200).json({
      success: true,
      user: req.user.toSafeObject()
    });
  } catch (error) {
    next(error);
  }
};

export const getProfile = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User profile not found'
      });
    }

    return res.status(200).json({
      success: true,
      user: user.toSafeObject()
    });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    // Explicitly reject any attempt by customer to escalate to ADMIN or change role
    if (req.body.role && req.body.role !== req.user.role) {
      return res.status(403).json({
        success: false,
        message: 'Modifying account role is strictly prohibited.'
      });
    }

    const { updateProfileSchema, normalizeProfileInput } = await import('../validators/profileValidator.js');
    const validated = updateProfileSchema.parse(req.body);
    const normalized = normalizeProfileInput(validated);

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User profile not found'
      });
    }

    if (normalized.name !== undefined) {
      user.name = normalized.name;
    }

    if (normalized.phone !== undefined) {
      user.phone = normalized.phone;
    }

    if (normalized.themePreference !== undefined) {
      user.themePreference = normalized.themePreference;
    }

    if (normalized.defaultAddress !== undefined) {
      user.defaultAddress = normalized.defaultAddress;
    }

    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: user.toSafeObject()
    });
  } catch (error) {
    next(error);
  }
};

export const getAdministrators = async (req, res, next) => {
  try {
    const admins = await User.find({ role: 'ADMIN' })
      .select('-password')
      .sort({ createdAt: 1 });

    return res.status(200).json({
      success: true,
      count: admins.length,
      administrators: admins.map((a) => a.toSafeObject())
    });
  } catch (error) {
    next(error);
  }
};

export const createAdministrator = async (req, res, next) => {
  try {
    const { name, email, password, phone } = req.body;

    if (!name || name.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Name must be at least 2 characters long'
      });
    }

    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address'
      });
    }

    if (!password || password.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters long'
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      if (existing.role === 'ADMIN') {
        return res.status(409).json({
          success: false,
          message: 'An administrator account with this email already exists.'
        });
      }

      // Promote existing user to ADMIN and update password
      existing.name = name.trim();
      existing.password = password; // pre-save hook will hash it
      existing.role = 'ADMIN';
      if (phone) existing.phone = phone.trim();
      await existing.save();

      return res.status(200).json({
        success: true,
        message: `User ${normalizedEmail} successfully promoted to Administrator.`,
        administrator: existing.toSafeObject()
      });
    }

    const newAdmin = new User({
      name: name.trim(),
      email: normalizedEmail,
      password: password, // pre-save hook will hash it with bcrypt
      phone: phone ? phone.trim() : '',
      role: 'ADMIN'
    });

    await newAdmin.save();

    return res.status(201).json({
      success: true,
      message: 'New administrator provisioned successfully',
      administrator: newAdmin.toSafeObject()
    });
  } catch (error) {
    next(error);
  }
};

