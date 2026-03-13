export interface Coupon {
  id: string;
  restaurantId: string;
  restaurantName: string;
  discount: string;
  description: string;
  expiresAt: Date;
  isUsed: boolean;
}

export const mockCoupons: Coupon[] = [
  {
    id: 'c1',
    restaurantId: '1',
    restaurantName: '老表烧烤',
    discount: '立减 ￥3',
    description: '满20元可用',
    expiresAt: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes from now
    isUsed: false,
  },
  {
    id: 'c2',
    restaurantId: '2',
    restaurantName: '螺蛳粉王',
    discount: '赠冰豆奶一瓶',
    description: '无门槛',
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
    isUsed: false,
  },
];
