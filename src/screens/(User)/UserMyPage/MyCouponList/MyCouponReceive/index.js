import React from 'react';
import EmptyState from '@components/EmptyState';

import CouponIcon from '@assets/images/coupon_black.svg';

const MyCouponReceive = () => {
  return (
    <EmptyState
      icon={CouponIcon}
      iconSize={{width: 68, height: 68}}
      title="준비 중인 쿠폰이 없어요"
      description="콘텐츠나 프로모션이 열리면 여기에서 받을 수 있어요."
    />
  );
};

export default MyCouponReceive;
