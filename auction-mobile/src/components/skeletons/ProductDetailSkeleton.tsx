import React from 'react';
import { View, ScrollView, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { THEME_COLORS } from '../../constants/api';
import { scale, verticalScale } from '../../utils/responsive';
import PatternBackground from '../common/PatternBackground';

const { width: screenWidth } = Dimensions.get('window');

// Reusable Skeleton Components
export const SkeletonBox: React.FC<{ width: number; height: number; style?: any }> = ({ width, height, style }) => (
  <View style={[{
    width,
    height,
    backgroundColor: THEME_COLORS.gray[200],
    borderRadius: scale(8),
  }, style]} />
);

export const SkeletonText: React.FC<{ width: number; height?: number }> = ({ width, height = 16 }) => (
  <SkeletonBox width={width} height={height} style={{ borderRadius: scale(4) }} />
);

export const SkeletonCard: React.FC<{ children: React.ReactNode; style?: any }> = ({ children, style }) => (
  <View style={[{
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    marginHorizontal: scale(20),
    marginTop: verticalScale(16),
    borderRadius: scale(24),
    padding: scale(20),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: verticalScale(8) },
    shadowOpacity: 0.15,
    shadowRadius: scale(32),
    elevation: 12,
    borderWidth: scale(1.5),
    borderColor: 'rgba(255, 255, 255, 0.8)',
  }, style]}>
    {children}
  </View>
);

const ProductDetailSkeleton: React.FC = () => (
  <PatternBackground>
    <SafeAreaView style={{ flex: 1 }}>
      {/* Header Skeleton */}
      <View style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        marginHorizontal: scale(20),
        marginTop: verticalScale(20),
        borderRadius: scale(24),
        padding: scale(20),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: verticalScale(8) },
        shadowOpacity: 0.15,
        shadowRadius: scale(32),
        elevation: 12,
        borderWidth: scale(1.5),
        borderColor: 'rgba(255, 255, 255, 0.8)',
      }}>
        <SkeletonBox width={scale(44)} height={scale(44)} style={{ borderRadius: scale(22) }} />
        <SkeletonText width={scale(150)} height={scale(20)} />
        <SkeletonBox width={scale(44)} height={scale(44)} style={{ borderRadius: scale(22) }} />
      </View>

      <ScrollView 
        style={{ flex: 1, marginTop: verticalScale(16) }} 
        contentContainerStyle={{ paddingBottom: verticalScale(120) }}
      >
        {/* Image Skeleton */}
        <View style={{
          marginHorizontal: scale(20),
          borderRadius: scale(24),
          overflow: 'hidden',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: verticalScale(8) },
          shadowOpacity: 0.15,
          shadowRadius: scale(32),
          elevation: 12,
        }}>
          <SkeletonBox width={screenWidth - scale(40)} height={scale(280)} style={{ borderRadius: scale(24) }} />
        </View>

        {/* Product Info Skeleton */}
        <SkeletonCard>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <SkeletonText width={scale(200)} height={scale(24)} />
            <SkeletonBox width={scale(80)} height={scale(32)} style={{ borderRadius: scale(16) }} />
          </View>
          <View style={{ marginTop: verticalScale(16), gap: verticalScale(8) }}>
            <SkeletonText width={scale(150)} height={scale(16)} />
            <SkeletonText width={scale(120)} height={scale(16)} />
            <SkeletonText width={scale(180)} height={scale(16)} />
          </View>
        </SkeletonCard>

        {/* Pricing Skeleton */}
        <SkeletonCard>
          <SkeletonText width={scale(160)} height={scale(18)} />
          <View style={{ 
            flexDirection: 'row', 
            justifyContent: 'space-between', 
            marginTop: verticalScale(16) 
          }}>
            <View>
              <SkeletonText width={scale(80)} height={scale(14)} />
              <View style={{ marginTop: verticalScale(4) }}>
                <SkeletonText width={scale(100)} height={scale(24)} />
              </View>
            </View>
            <View>
              <SkeletonText width={scale(80)} height={scale(14)} />
              <View style={{ marginTop: verticalScale(4) }}>
                <SkeletonText width={scale(100)} height={scale(20)} />
              </View>
            </View>
          </View>
          <View style={{ 
            flexDirection: 'row', 
            justifyContent: 'space-between', 
            marginTop: verticalScale(16) 
          }}>
            <View>
              <SkeletonText width={scale(90)} height={scale(14)} />
              <View style={{ marginTop: verticalScale(4) }}>
                <SkeletonText width={scale(80)} height={scale(20)} />
              </View>
            </View>
            <View>
              <SkeletonText width={scale(70)} height={scale(14)} />
              <View style={{ marginTop: verticalScale(4) }}>
                <SkeletonText width={scale(80)} height={scale(20)} />
              </View>
            </View>
          </View>
        </SkeletonCard>

        {/* Bidding Skeleton */}
        <SkeletonCard>
          <SkeletonBox width={screenWidth - scale(80)} height={scale(120)} style={{ borderRadius: scale(16) }} />
        </SkeletonCard>

        {/* Description Skeleton */}
        <SkeletonCard>
          <SkeletonText width={scale(100)} height={scale(18)} />
          <View style={{ marginTop: verticalScale(16), gap: verticalScale(8) }}>
            <SkeletonText width={screenWidth - scale(80)} height={scale(16)} />
            <SkeletonText width={screenWidth - scale(120)} height={scale(16)} />
            <SkeletonText width={screenWidth - scale(100)} height={scale(16)} />
          </View>
        </SkeletonCard>

        {/* Seller Info Skeleton */}
        <SkeletonCard>
          <SkeletonText width={scale(140)} height={scale(18)} />
          <View style={{ 
            flexDirection: 'row', 
            alignItems: 'center', 
            marginTop: verticalScale(16) 
          }}>
            <SkeletonBox width={scale(48)} height={scale(48)} style={{ borderRadius: scale(24) }} />
            <View style={{ marginLeft: scale(12), flex: 1 }}>
              <SkeletonText width={scale(120)} height={scale(18)} />
              <View style={{ marginTop: verticalScale(4) }}>
                <SkeletonText width={scale(100)} height={scale(14)} />
              </View>
            </View>
          </View>
        </SkeletonCard>

        {/* Bid History Skeleton */}
        <SkeletonCard>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <SkeletonText width={scale(100)} height={scale(18)} />
            <SkeletonBox width={scale(20)} height={scale(20)} style={{ borderRadius: scale(10) }} />
          </View>
          <View style={{ marginTop: verticalScale(16), gap: verticalScale(12) }}>
            {[1, 2, 3].map((item) => (
              <View key={item} style={{
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                borderRadius: scale(16),
                padding: scale(16),
                borderWidth: scale(1),
                borderColor: THEME_COLORS.gray[200],
              }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <SkeletonBox width={scale(48)} height={scale(48)} style={{ borderRadius: scale(24) }} />
                  <View style={{ marginLeft: scale(12), flex: 1 }}>
                    <SkeletonText width={scale(120)} height={scale(16)} />
                    <View style={{ marginTop: verticalScale(4) }}>
                      <SkeletonText width={scale(80)} height={scale(14)} />
                    </View>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <SkeletonText width={scale(80)} height={scale(20)} />
                  </View>
                </View>
              </View>
            ))}
          </View>
        </SkeletonCard>
      </ScrollView>
    </SafeAreaView>
  </PatternBackground>
);

export default ProductDetailSkeleton; 