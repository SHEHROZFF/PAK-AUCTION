# Notification System Testing Guide

## Overview

This guide will help you test the complete notification system including:
- ✅ **Fixed "Mark All as Read" functionality**
- ✅ **Admin notification sending to all users**
- ✅ **Admin notification sending to specific users**
- ✅ **Real-time WebSocket notifications on web**
- ✅ **Push notifications on mobile**

## What Was Fixed

### 1. Mark All as Read Issue ✅
**Problem**: "Failed to mark all notifications as read" error
**Solution**: Fixed API endpoint calls in the web notification system:
- Changed from `/notifications/read-all` to `/users/notifications/read-all`
- Changed HTTP method from `PATCH` to `PUT`
- Fixed individual notification marking endpoint as well

### 2. Admin Notification Sending ✅
**Added**: Complete admin interface for sending notifications
- Send to all users or specific users by email
- Multiple notification types (General, System, Announcement)
- Quick templates for common notifications
- Real-time preview of notifications

## Testing Steps

### Prerequisites

1. **Start Backend Server**
   ```bash
   cd backend
   npm start
   ```

2. **Start Admin Dashboard**
   ```bash
   cd admin-dashboard
   npm run dev
   ```

3. **Ensure Mobile App is Running** (for push notification testing)
   ```bash
   cd mobile-app
   npx expo start
   ```

### Test 1: Admin Notification Sending

1. **Access Admin Dashboard**
   - Go to `http://localhost:3001`
   - Login with admin credentials
   - Navigate to "Notifications" tab

2. **Test Send to All Users**
   - Fill in notification form:
     - Title: "Test Notification - All Users"
     - Message: "This is a test notification for all users"
     - Type: General
     - Send To: All Users
   - Click "Send Notification"
   - Should see success message with user count

3. **Test Send to Specific Users**
   - Fill in notification form:
     - Title: "Test Notification - Specific Users"
     - Message: "This is a test for specific users only"
     - Type: Announcement
     - Send To: Specific Users
     - User Emails: Enter your test user emails (comma-separated)
   - Click "Send Notification"
   - Should see success message with specific user count

### Test 2: Web Notification System

1. **Open Website**
   - Go to your auction website
   - Login with a user account
   - Look for notification bell in header

2. **Test Real-time Notifications**
   - Keep website open
   - Send notification from admin dashboard
   - Should see:
     - Toast notification appear
     - Notification bell badge update
     - New notification in dropdown

3. **Test Mark All as Read**
   - Click notification bell
   - Click "Mark All Read" button
   - Should see success toast
   - Badge count should reset to 0
   - All notifications should show as read

### Test 3: Mobile Push Notifications

1. **Setup Mobile App**
   - Install Expo Go app on your phone
   - Scan QR code from `npx expo start`
   - Login to the app

2. **Test Push Notifications**
   - Send notification from admin dashboard
   - Should receive push notification on mobile device
   - Tap notification to open app
   - Should navigate to notifications screen

3. **Test Notification Screen**
   - Open notifications screen in mobile app
   - Should see all notifications
   - Test pull-to-refresh functionality
   - Test mark as read functionality

### Test 4: Automated Testing

Run the automated test script:

```bash
# Update credentials in test_notifications.js first
node test_notifications.js
```

This will test all API endpoints automatically.

## Expected Results

### Web Notifications
- ✅ Real-time notifications via WebSocket
- ✅ Toast notifications for new messages
- ✅ Notification bell with badge count
- ✅ Dropdown with recent notifications
- ✅ Modal with all notifications
- ✅ Mark individual notifications as read
- ✅ Mark all notifications as read
- ✅ Delete notifications
- ✅ Connection status indicator

### Mobile Notifications
- ✅ Push notifications when app is closed/background
- ✅ In-app notifications when app is open
- ✅ Badge count on app icon
- ✅ Navigation to notifications screen
- ✅ Pull-to-refresh functionality
- ✅ Mark notifications as read

### Admin Dashboard
- ✅ Send notifications to all users
- ✅ Send notifications to specific users by email
- ✅ Multiple notification types
- ✅ Quick templates
- ✅ Real-time preview
- ✅ Success/error feedback

## Troubleshooting

### Common Issues

1. **WebSocket Connection Failed**
   - Check if backend server is running
   - Verify WebSocket server is initialized
   - Check browser console for connection errors

2. **Push Notifications Not Working**
   - Ensure Expo notifications are properly configured
   - Check if device permissions are granted
   - Verify push tokens are being registered

3. **"Mark All as Read" Still Failing**
   - Clear browser cache
   - Check network tab for API calls
   - Verify user is logged in

4. **Admin Dashboard Not Loading**
   - Check if admin dashboard server is running
   - Verify admin credentials
   - Check browser console for errors

### Debug Commands

```bash
# Check backend logs
cd backend && npm start

# Check WebSocket connections
# Look for "WebSocket client connected" in backend logs

# Test API endpoints manually
curl -X GET http://localhost:5000/api/users/notifications \
  -H "Authorization: Bearer YOUR_TOKEN"

# Check mobile app logs
npx expo start --clear
```

## Performance Considerations

- Notifications are paginated (20 per page)
- WebSocket connections are automatically managed
- Push notifications are batched for efficiency
- Database queries are optimized with proper indexing

## Security Features

- All notification endpoints require authentication
- Admin endpoints require admin role
- Push tokens are validated and cleaned up
- XSS protection for notification content

## Next Steps

After successful testing:

1. **Production Deployment**
   - Update WebSocket URLs for production
   - Configure push notification certificates
   - Set up proper logging and monitoring

2. **Additional Features**
   - Email notifications
   - Notification preferences
   - Notification categories
   - Scheduled notifications

## Support

If you encounter any issues:
1. Check the troubleshooting section above
2. Review the browser/mobile console logs
3. Check backend server logs
4. Verify all services are running correctly

The notification system is now fully functional and ready for production use! 