# Professional Notification System Setup Guide

This guide will help you set up a professional-grade notification system with push notifications for mobile and real-time notifications for web using your existing APIs.

## 🚀 Features

### Mobile App (React Native/Expo)
- ✅ Push notifications using Expo Notifications
- ✅ Real-time notification updates
- ✅ Professional notification screen with proper UI/UX
- ✅ Badge count management
- ✅ Notification navigation handling
- ✅ Offline notification support

### Website
- ✅ Real-time notifications via WebSockets
- ✅ Professional notification dropdown and modal
- ✅ Toast notifications for new messages
- ✅ Connection status indicator
- ✅ Mark all as read functionality
- ✅ Notification deletion

### Backend
- ✅ Push notification service using Expo Server SDK
- ✅ WebSocket server for real-time updates
- ✅ Automatic notification creation for auction events
- ✅ Token management and cleanup
- ✅ Scalable notification delivery

## 📦 Installation

### Backend Dependencies

```bash
cd backend
npm install expo-server-sdk ws
```

### Mobile App Dependencies

```bash
cd auction-mobile
npx expo install expo-notifications expo-device expo-constants
```

### Website Dependencies

No additional dependencies needed - uses native WebSocket API.

## 🔧 Configuration

### 1. Backend Configuration

The backend is already configured with:
- WebSocket server initialization
- Push notification service
- Notification routes and controllers
- User model with push tokens

### 2. Mobile App Setup

#### Update your store configuration:

```typescript
// auction-mobile/src/store/index.ts
import notificationsReducer from './slices/notificationsSlice';

export const store = configureStore({
  reducer: {
    // ... existing reducers
    notifications: notificationsReducer,
  },
});
```

#### Initialize push notifications in your App component:

```typescript
// auction-mobile/App.tsx
import { pushNotificationService } from './src/services/pushNotificationService';

export default function App() {
  useEffect(() => {
    const initializeNotifications = async () => {
      // Initialize push notifications
      await pushNotificationService.initialize();
      
      // Setup listeners
      const listeners = pushNotificationService.setupNotificationListeners();
      
      // Cleanup on unmount
      return () => {
        listeners.notificationListener.remove();
        listeners.responseListener.remove();
      };
    };

    initializeNotifications();
  }, []);

  // ... rest of your app
}
```

#### Add NotificationsScreen to your navigation:

```typescript
// auction-mobile/src/navigation/MainNavigator.tsx
import NotificationsScreen from '../screens/NotificationsScreen';

// Add to your stack navigator
<Stack.Screen 
  name="Notifications" 
  component={NotificationsScreen}
  options={{ title: 'Notifications' }}
/>
```

### 3. Website Setup

#### Include the notification system files:

```html
<!-- Add to all HTML pages -->
<link rel="stylesheet" href="css/notifications.css">
<script src="js/notificationSystem.js"></script>
```

#### The notification system will automatically initialize when:
- User is logged in (has accessToken in localStorage)
- DOM is ready

## 🎯 Usage

### Automatic Notifications

The system automatically creates notifications for:

1. **Bid Placed** - When someone bids on your auction
2. **Bid Outbid** - When your bid is outbid
3. **Auction Won** - When you win an auction
4. **Auction Ended** - When your auction ends
5. **Auction Starting** - When a watched auction is starting

### Manual Notifications (Admin)

Admins can send notifications to all users:

```javascript
// From admin dashboard
POST /api/admin/notifications
{
  "title": "System Maintenance",
  "message": "The system will be down for maintenance from 2-4 AM",
  "type": "GENERAL"
}
```

### Mobile App API Usage

```typescript
// Get notifications
const notifications = await apiService.getNotifications({ page: 1, limit: 20 });

// Mark as read
await apiService.markNotificationRead(notificationId);

// Mark all as read
await apiService.markAllNotificationsRead();

// Register push token
await apiService.registerPushToken(expoPushToken);
```

### Website API Usage

```javascript
// The notification system handles all API calls automatically
// You can also manually trigger actions:

// Mark all as read
await notificationSystem.markAllAsRead();

// Delete notification
await notificationSystem.deleteNotification(notificationId);
```

## 🔄 Real-time Updates

### WebSocket Connection

The system maintains a WebSocket connection for real-time updates:

- **URL**: `ws://localhost:5000` (development) / `wss://your-domain.com` (production)
- **Authentication**: Token passed as query parameter
- **Auto-reconnection**: Up to 5 attempts with exponential backoff

### Message Types

1. **notification** - New notification received
2. **notification_read** - Notification marked as read
3. **unread_count** - Updated unread count

## 🎨 UI/UX Features

### Mobile App
- Material Design inspired notification items
- Swipe gestures for actions
- Pull-to-refresh functionality
- Empty state handling
- Loading states
- Connection status indicator

### Website
- Professional dropdown with recent notifications
- Full-screen modal for all notifications
- Toast notifications for new messages
- Connection status indicator
- Responsive design for all screen sizes
- Dark mode support

## 🔧 Customization

### Notification Types

Add new notification types in:

```typescript
// Mobile: auction-mobile/src/store/slices/notificationsSlice.ts
export interface Notification {
  type: 'BID_PLACED' | 'BID_OUTBID' | 'AUCTION_WON' | 'AUCTION_ENDED' | 'AUCTION_STARTING' | 'GENERAL' | 'YOUR_NEW_TYPE';
}

// Backend: backend/models/Notification.js
type: {
  type: String,
  enum: ['BID_PLACED', 'BID_OUTBID', 'AUCTION_WON', 'AUCTION_ENDED', 'AUCTION_STARTING', 'GENERAL', 'YOUR_NEW_TYPE'],
  default: 'GENERAL'
}
```

### Styling

#### Mobile App
Modify styles in `auction-mobile/src/screens/NotificationsScreen.tsx`

#### Website
Modify styles in `Auction_Site/css/notifications.css`

### Push Notification Customization

```typescript
// auction-mobile/src/services/pushNotificationService.ts
// Customize notification appearance
messages.push({
  to: pushToken,
  sound: 'default', // or custom sound
  title: notification.title,
  body: notification.message,
  data: { /* custom data */ },
  badge: unreadCount,
  // Add custom styling
  color: '#FF0000', // Android
  icon: './assets/notification-icon.png', // Android
});
```

## 🚨 Troubleshooting

### Common Issues

1. **Push notifications not working**
   - Ensure you're testing on a physical device
   - Check if permissions are granted
   - Verify Expo push token is valid

2. **WebSocket connection failing**
   - Check if server is running
   - Verify token is valid
   - Check CORS configuration

3. **Notifications not appearing in UI**
   - Check if Redux store is properly configured
   - Verify API responses
   - Check console for errors

### Debug Mode

Enable debug logging:

```typescript
// Mobile
console.log('Push token:', pushNotificationService.getExpoPushToken());

// Website
localStorage.setItem('debug_notifications', 'true');
```

## 🔒 Security Considerations

1. **Token Validation**: All WebSocket connections are authenticated
2. **User Isolation**: Users only receive their own notifications
3. **Rate Limiting**: Prevent notification spam
4. **Token Cleanup**: Invalid push tokens are automatically removed

## 📊 Performance

### Optimizations Implemented

1. **Efficient Queries**: Indexed database queries
2. **Pagination**: Limit notification loading
3. **Connection Pooling**: Reuse WebSocket connections
4. **Batch Processing**: Group push notifications
5. **Lazy Loading**: Load notifications on demand

## 🌐 Production Deployment

### Environment Variables

```bash
# Backend .env
JWT_SECRET=your_jwt_secret
CORS_ORIGIN=https://your-domain.com

# Update WebSocket URLs in:
# - Auction_Site/js/notificationSystem.js
# - Update wsURL to wss://your-domain.com
```

### Server Configuration

Ensure your server supports WebSocket connections:

```nginx
# Nginx configuration
location /ws {
    proxy_pass http://localhost:5000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host $host;
}
```

## 📈 Monitoring

### Metrics to Track

1. **Push Notification Delivery Rate**
2. **WebSocket Connection Success Rate**
3. **Notification Open Rate**
4. **User Engagement with Notifications**

### Logging

The system includes comprehensive logging:
- Push notification delivery status
- WebSocket connection events
- Notification creation and delivery
- Error tracking and debugging

## 🎉 Testing

### Manual Testing

1. **Mobile**: Create test notifications from admin panel
2. **Website**: Open multiple browser tabs to test real-time updates
3. **Push**: Send test notifications to verify delivery

### Automated Testing

Consider adding tests for:
- Notification creation
- WebSocket message handling
- Push token management
- API endpoints

---

Your professional notification system is now ready! 🚀

The system provides:
✅ Real-time notifications for web
✅ Push notifications for mobile
✅ Professional UI/UX
✅ Scalable architecture
✅ Comprehensive error handling
✅ Production-ready features 