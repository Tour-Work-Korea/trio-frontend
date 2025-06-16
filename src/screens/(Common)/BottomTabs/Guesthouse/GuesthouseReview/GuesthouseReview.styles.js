import { StyleSheet } from 'react-native';
import { COLORS } from '@constants/colors';

const styles = StyleSheet.create({
    reviewRowContainer: {
    },
    reviewContainer: {
        backgroundColor: COLORS.grayscale_100,
        padding: 8,
        borderRadius: 8,
        marginVertical: 2,
    },

    // 유저 사진, 닉네임, 별점
    reviewHeaderContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    userProfileContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    userImage: {
        height: 44,
        width: 44,
        borderRadius: 100,
        backgroundColor: COLORS.grayscale_300,
    },
    userNicknameText: {
        marginLeft: 12,
    },

    // 유저 별점
    userRatingContainer: {
        flexDirection: 'row',
        backgroundColor: COLORS.grayscale_800,
        paddingHorizontal: 10,
        paddingVertical: 2,
        borderRadius: 100,
        alignItems: 'center',
        justifyContent: 'center',
    },
    userRatingText: {
        color: COLORS.grayscale_0,
        marginLeft: 4,
    },

    // 리뷰 이미지
    reviewImageContainer: {
        flexDirection: 'row',
        marginTop: 10,
        gap: 4,
    },
    reviewImage: {
        height: 100,
        width: 100,
        borderRadius: 4,
    },

    // 리뷰 내용
    reviewText: {
        marginTop: 10,
    },

    // 답글
    replyContainer: {
        backgroundColor: COLORS.grayscale_0,
        padding: 8,
        borderRadius: 8,
        marginTop: 10,
    },
    replyTitle: {
        color: COLORS.grayscale_400,
    },
    replyText: {
        color: COLORS.grayscale_800,
        marginTop: 4,
    },
});

export default styles;