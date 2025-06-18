# Auction Mobile App

A complete React Native mobile application for the auction platform built with Expo, featuring a comprehensive authentication system with OTP verification.

## 🚀 Features

### ✅ Complete Authentication System
- **User Registration** with email verification
- **OTP-based Email Verification** (6-digit code)
- **Login** with JWT token authentication
- **Forgot Password** with OTP reset
- **Password Reset** with OTP verification
- **Secure Token Storage** using Expo SecureStore
- **Auto Token Refresh** with interceptors
- **Persistent Authentication** state

### 🎨 Professional UI/UX
- **Beautiful Gradient Designs** matching the web version
- **Responsive Components** with proper validation
- **Toast Notifications** for user feedback
- **Loading States** and error handling
- **Smooth Animations** and transitions
- **Professional Form Validation**

### 🏗️ Technical Architecture
- **Redux Toolkit** for state management
- **TypeScript** for type safety
- **React Navigation** for routing
- **Axios** with interceptors for API calls
- **Expo SecureStore** for secure data storage
- **Modular Component Structure**

## 📱 Screenshots

The app features a modern design with:
- Gradient backgrounds matching your auction site
- Professional form layouts
- Smooth OTP input experience
- Consistent branding and colors

## 🛠️ Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- Expo CLI (`npm install -g @expo/cli`)
- Your auction backend API running on `http://localhost:5000`

### Installation Steps

1. **Clone and Navigate**
   ```bash
   cd auction-mobile
   npm install
   ```

2. **Configure API Endpoint**
   Update the API base URL in `src/constants/api.ts`:
   ```typescript
   export const API_BASE_URL = 'http://your-backend-url:5000/api';
   ```

3. **Start the Development Server**
   ```bash
   npm start
   ```

4. **Run on Device/Simulator**
   - **iOS**: Press `i` or scan QR code with Camera app
   - **Android**: Press `a` or scan QR code with Expo Go app
   - **Web**: Press `w` for web version

## 📁 Project Structure

```
src/
├── components/
│   └── common/
│       ├── Button.tsx          # Reusable button component
│       └── InputField.tsx      # Form input with validation
├── constants/
│   └── api.ts                  # API endpoints and configuration
├── navigation/
│   └── AuthNavigator.tsx       # Authentication flow navigation
├── screens/
│   ├── auth/
│   │   ├── LoginScreen.tsx     # Login with email/password
│   │   ├── RegisterScreen.tsx  # Registration form
│   │   ├── VerifyEmailScreen.tsx    # OTP email verification
│   │   ├── ForgotPasswordScreen.tsx # Forgot password request
│   │   └── ResetPasswordScreen.tsx  # Password reset with OTP
│   └── HomeScreen.tsx          # Main app (placeholder)
├── services/
│   └── api.ts                  # API service with interceptors
├── store/
│   ├── index.ts               # Redux store configuration
│   └── slices/
│       └── authSlice.ts       # Authentication state management
└── types/
    └── auth.ts                # TypeScript interfaces
```

## 🔧 Configuration

### API Endpoints
The app connects to your existing backend API endpoints:

```typescript
AUTH: {
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  VERIFY_EMAIL: '/auth/verify-email',
  FORGOT_PASSWORD: '/auth/forgot-password',
  RESET_PASSWORD: '/auth/reset-password',
  REFRESH_TOKEN: '/auth/refresh-token',
  LOGOUT: '/auth/logout',
  PROFILE: '/auth/profile',
}
```

### Environment Variables
Create a `.env` file for environment-specific configuration:
```
API_BASE_URL=http://localhost:5000/api
```

## 🔐 Authentication Flow

1. **Registration**: User fills form → OTP sent to email → Email verification → Account created
2. **Login**: Email/password → JWT tokens stored securely → Auto-refresh on expiry
3. **Forgot Password**: Email input → OTP sent → Reset password with OTP → Success
4. **Persistent Auth**: Tokens stored securely → Auto-login on app restart → Profile validation

## 🎯 Usage

### Running the App
```bash
# Start development server
npm start

# Run on specific platform
npm run android
npm run ios
npm run web
```

### Testing Authentication
1. **Register**: Create a new account with valid email
2. **Verify**: Check email for 6-digit OTP code
3. **Login**: Use registered credentials
4. **Test Persistence**: Close and reopen app (should stay logged in)
5. **Forgot Password**: Test password reset flow

## 🔄 State Management

The app uses Redux Toolkit for state management:

```typescript
// Authentication state
interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  verificationSent: boolean;
  passwordResetSent: boolean;
}
```

## 🛡️ Security Features

- **Secure Token Storage**: JWT tokens stored in Expo SecureStore
- **Auto Token Refresh**: Automatic token renewal before expiry
- **Request Interceptors**: Automatic token attachment to API calls
- **Input Validation**: Client-side form validation
- **Error Handling**: Comprehensive error management

## 🚀 Next Steps

After authentication is working, you can extend the app with:

1. **Auction Listings**: Browse and search auctions
2. **Bidding System**: Place and manage bids
3. **User Profile**: Edit profile and view history
4. **Push Notifications**: Real-time auction updates
5. **Image Upload**: Camera integration for auction photos
6. **Payment Integration**: Stripe/PayPal for transactions

## 🐛 Troubleshooting

### Common Issues

1. **Network Error**: Ensure backend is running and API_BASE_URL is correct
2. **OTP Not Received**: Check email spam folder and backend email configuration
3. **Token Refresh Failed**: Clear app data and re-login
4. **Build Errors**: Run `npm install` and restart Metro bundler

### Debug Mode
Enable debug logging in development:
```typescript
// In api.ts
console.log('API Request:', config);
console.log('API Response:', response);
```

## 📝 API Integration

The app is designed to work with your existing backend API. Ensure these endpoints are implemented:

- `POST /auth/register` - User registration
- `POST /auth/verify-email` - Email verification with OTP
- `POST /auth/login` - User login
- `POST /auth/forgot-password` - Password reset request
- `POST /auth/reset-password` - Password reset with OTP
- `POST /auth/refresh-token` - Token refresh
- `GET /auth/profile` - Get user profile

## 🤝 Contributing

1. Follow the existing code structure
2. Use TypeScript for all new files
3. Add proper error handling
4. Test on both iOS and Android
5. Update documentation for new features

## 📄 License

This project is part of the auction platform system.

---

**Ready to build the complete auction experience!** 🎯

The authentication system is fully functional and ready for integration with your auction features. 