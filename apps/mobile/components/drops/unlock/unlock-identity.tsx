import { Text } from '@flama/design-system-mobile/text';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { MOCK_ACCOUNT, UNLOCK_LIGHT } from './unlock-theme';

type UnlockIdentityProps = {
  /** Initials shown on the avatar disc. Defaults to the mock account. */
  initials?: string;
};

/**
 * The locked-vault identity block: a 96px avatar disc with the account
 * initials over a translucent-white circle, and a "Welcome back" greeting.
 * Explicit lineHeights throughout — the DS Text base is 16/24, so enlarged
 * styles must bring their own line box or the glyphs shear.
 */
export function UnlockIdentity({ initials = MOCK_ACCOUNT.initials }: UnlockIdentityProps) {
  const { t } = useTranslation();

  return (
    <View className="items-center">
      <View
        className="items-center justify-center rounded-full"
        style={{
          width: 96,
          height: 96,
          backgroundColor: UNLOCK_LIGHT.avatarBg,
        }}
      >
        <Text
          className="font-sans font-bold"
          style={{ fontSize: 34, lineHeight: 42, color: UNLOCK_LIGHT.avatarFg }}
        >
          {initials}
        </Text>
      </View>
      <Text
        className="font-sans font-bold"
        style={{
          fontSize: 27,
          lineHeight: 33,
          color: UNLOCK_LIGHT.fg,
          marginTop: 22,
          letterSpacing: -0.2,
        }}
      >
        {t('unlock.welcomeBack')}
      </Text>
    </View>
  );
}
