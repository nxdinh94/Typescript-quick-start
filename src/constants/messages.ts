export const USERS_MESSAGES = {
    VALIDATION_ERROR: 'Validation error',
    EMAIL_ALREADY_EXIST: 'Email already exists',
    EMAIL_IS_INVALID: 'Email is invalid',
    EMAIL_IS_REQUIRED : 'Email is required',
    USER_NOT_FOUND:'User not found',
    NAME_IS_REQUIRED : 'Name is required',
    NAME_MUST_BE_STRING: 'Name must be a string',
    NAME_LENGTH_MUST_BE_FROM_1_TO_100: 'Name length must be from 1 to 100',
    PASSWORD_IS_REQUIRED : 'Password is required',
    PASSWORD_MUST_BE_A_STRING: 'Password must be a string',
    PASSWORD_LENGTH_MUST_BE_FROM_6_TO_50: 'Password length must be from 6 to 50',
    BIO_LENGTH_MUST_BE_FROM_1_TO_200: 'Bio length must be from 1 to 200',
    PASSWORD_MUST_BE_STRONG: 'Password must be contain atleast 1 upperCase, 1 lowerCase, 1 number and 1 symbol',
    CONFIRM_PASSWORD_IS_REQUIRED: 'Confirm password is required',
    CONFIRM_PASSWORD_MUST_BE_A_STRING:'Confirm password must be a string',
    CONFIRM_PASSWORD_LENGTH_MUST_BE_FROM_6_TO_50: 'Confirm password length must be from 6 to 50',
    CONFIRM_PASSWORD_MUST_BE_STRONG: 'Confirm password must be contain atleast 1 upperCase, 1 lowerCase, 1 number and 1 symbol',
    CONFIRM_PASSWORD_IS_INVALID: 'Confirm password is invalid',
    DATE_OF_BIRTH_MUST_BE_ISO8601 : 'Date of birth must be ISO8601',
    LOGGIN_SUCCESS: 'Loggin success',
    LOGGIN_FAIL: 'Loggin fail',
    REGISTER_SUCCESS: 'Register success',
    REGISTER_FAIL: 'Register fail',
    EMAIL_OR_PASSWORD_IS_INCORRECT: 'Email or password is incorrect',
    ACCESS_TOKEN_IS_REQUIRED: 'Access token is required',
    ACCESS_TOKEN_IS_INVALID: 'Access token is required',
    REFRESH_TOKEN_IS_INVALID: 'Refrsh token is invalid',
    REFRESH_TOKEN_IS_REQUIRED: 'Refresh token is required',
    USED_REFRESH_TOKEN_OR_NOT_EXISTS : 'Refresh token đã được sử dụng hoặc không tồn tại',
    LOGOUT_SUCCESS: 'Logout success',
    EMAIL_VERIFY_TOKEN_IS_REQUIRED: 'Email verify token is required',
    EMAIL_ALREADY_VERIFIED_BEFORE: 'Email already verified before',
    EMAIL_VERIFIED_SUCCESS: 'Email verified success',
    RESEND_VERIFY_EMAIL_SUCCESS: 'Resend verify email success',
    CHECK_EMAIL_TO_RESET_PASSWORD: 'Check email to reset password',
    FORGOT_PASSWORD_TOKEN_IS_REQUIRED: 'Forgot password token is required',
    VERIFIED_FORGOT_PASSWORD_SUCCESS: 'Verified forgot password success',
    FORGOT_PASSWORD_TOKEN_IS_INVALID: 'Forgot_password_token is invalid',
    RESET_PASSWORD_SUCCESS: 'Reset password success',
    GET_ME_SUCCESS: 'Get me success',
    GET_PROFILE_SUCCESS: 'Get profile success',
    USER_NOT_VERIFIED: 'User not verified',
    BIO_MUST_BE_STRING: 'Bio must be string',
    LOCATION_MUST_BE_STRING: 'Location must be string',
    LOCATION_LENGTH_MUST_BE_FROM_1_TO_200: 'Location length must be from 1 to 200',
    WEBSITE_MUST_BE_STRING: 'Website must be string',
    WEBSITE_LENGTH_MUST_BE_FROM_1_TO_200: 'Website length must be from 1 to 200',
    USERNAME_MUST_BE_STRING: 'Username must be string',
    USERNAME_EXISTED: 'Username existed',
    USERNAME_IS_INVALID: 'Username must be 4-15 characters long and contain only lettes, numbers, underscores, not only numbers',
    USERNAME_LENGTH_MUST_BE_FROM_1_TO_50: 'Username length must be from 1 to 50',
    AVATAR_MUST_BE_STRING: 'Avatar must be string',
    AVATAR_LENGTH_MUST_BE_FROM_1_TO_50: 'Avatar length must be from 1 to 50',
    COVER_PHOTO_MUST_BE_STRING: 'Cover photo must be string',
    COVER_PHOTO_LENGTH_MUST_BE_FROM_1_TO_50: 'Cover photo length must be from 1 to 50',
    UPDATE_ME_SUCCESS: 'Update me success',
    FOLLOWED_SUCCESS: 'Followed success',
    UN_FOLLOWED_SUCCESS: 'Unfollow success',
    NOT_FOLLOWED_THIS_ONE_BEFORE: 'You have not followed this one before',
    INVALID_FOLLOWED_USER_ID: 'Invalid followed user id',
    INVALID_USER_ID: 'Invalid user id',
    ALREADY_FOLLOWED_BEFORE: 'You have followed this one before',
} as const
