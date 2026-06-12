import { WalletBackground } from '@flama/design-system-mobile/wallet-background';
import { deriveHandle } from '@flama/frontend';
import {
  useDisableBiometrics,
  useEnableBiometrics,
  useLock,
  useLogout,
  useProfileState,
  useSecurityState,
  useSetNotificationsEnabled,
  useSettingsState,
  useWalletState,
} from '@flama/frontend/react';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import {
  Bell,
  DollarSign,
  Globe,
  Info,
  Lock,
  LogOut,
  Moon,
  ScanFace,
  ShieldCheck,
  Sparkles,
  Wallet,
} from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ProfileHeader } from '../components/drops/profile/profile-header';
import { ProfileIdentity } from '../components/drops/profile/profile-identity';
import { PROFILE_THEME } from '../components/drops/profile/profile-theme';
import { SettingsRow } from '../components/drops/profile/settings-row';
import { SettingsSection } from '../components/drops/profile/settings-section';
import { Routes } from '../lib/routes';

/** App version surfaced under Support → About. */
const APP_VERSION = '1.0';

/**
 * Profile & settings — the glass-on-gradient account screen
 * (`profile.html · profile/profile-app.jsx`). Renders the dark indigo wallet
 * shell by default and groups settings by concern: Account, Preferences,
 * Support and an isolated red danger zone.
 *
 * Wired to the domain: identity from the `profile` module, wallet/network
 * summary from `wallet`, currency/appearance/notifications from `settings`,
 * and Face ID + lock from `security`. Payment details are intentionally out of
 * this first version.
 */
export default function ProfileScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  const theme = PROFILE_THEME.dark;

  const { name } = useProfileState();
  const { wallets } = useWalletState();
  const settings = useSettingsState();
  const { biometricsAvailable, biometricsEnabled } = useSecurityState();

  const setNotifications = useSetNotificationsEnabled();
  const enableBiometrics = useEnableBiometrics();
  const disableBiometrics = useDisableBiometrics();
  const lock = useLock();
  const logout = useLogout();

  const displayName = name ?? t('profile.defaultName');
  const handle = deriveHandle(name ?? '');
  const activeWalletName = wallets[0]?.name ?? t('profile.account.noWallet');
  const networkCount = countActiveNetworks(wallets);

  const appearanceLabel = t(`profile.preferences.appearance.${settings.appearance}`);

  const onLock = () => {
    lock();
    router.replace(Routes.Unlock);
  };

  const onSignOut = () => {
    logout.mutate(undefined, {
      onSuccess: () => router.replace(Routes.Root),
    });
  };

  return (
    <WalletBackground variant="dark">
      <StatusBar style={theme.statusBar} />
      <View style={{ flex: 1, paddingTop: insets.top + 6 }}>
        <ProfileHeader theme={theme} onBack={() => router.back()} onUpgrade={() => {}} />

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 18,
            paddingTop: 14,
            paddingBottom: insets.bottom + 36,
          }}
        >
          <ProfileIdentity theme={theme} name={displayName} handle={handle} />

          <SettingsSection theme={theme} title={t('profile.sections.account')}>
            <SettingsRow
              theme={theme}
              icon={Wallet}
              label={t('profile.account.wallets')}
              value={activeWalletName}
              onPress={() => {}}
            />
            <SettingsRow
              theme={theme}
              icon={ShieldCheck}
              label={t('profile.account.recovery')}
              onPress={() => {}}
            />
            <SettingsRow
              theme={theme}
              icon={Globe}
              label={t('profile.account.networks')}
              value={t('profile.account.networksActive', {
                count: networkCount,
              })}
              onPress={() => {}}
              last
            />
          </SettingsSection>

          <SettingsSection theme={theme} title={t('profile.sections.preferences')}>
            <SettingsRow
              theme={theme}
              icon={DollarSign}
              label={t('profile.preferences.displayCurrency')}
              value={settings.displayCurrency}
              onPress={() => {}}
            />
            <SettingsRow
              theme={theme}
              icon={Moon}
              label={t('profile.preferences.appearanceLabel')}
              value={appearanceLabel}
              onPress={() => {}}
            />
            <SettingsRow
              theme={theme}
              icon={Bell}
              label={t('profile.preferences.notifications')}
              toggle
              toggleOn={settings.notificationsEnabled}
              onToggle={(next) => setNotifications.mutate(next)}
              toggleDisabled={setNotifications.isPending}
            />
            <SettingsRow
              theme={theme}
              icon={ScanFace}
              label={t('profile.preferences.faceId')}
              toggle
              toggleOn={biometricsEnabled}
              onToggle={(next) => (next ? enableBiometrics.mutate() : disableBiometrics.mutate())}
              toggleDisabled={
                !biometricsAvailable || enableBiometrics.isPending || disableBiometrics.isPending
              }
              last
            />
          </SettingsSection>

          <SettingsSection theme={theme} title={t('profile.sections.support')}>
            <SettingsRow
              theme={theme}
              icon={Info}
              label={t('profile.support.help')}
              onPress={() => {}}
            />
            <SettingsRow
              theme={theme}
              icon={Sparkles}
              label={t('profile.support.about')}
              value={`v${APP_VERSION}`}
              onPress={() => {}}
              last
            />
          </SettingsSection>

          <SettingsSection theme={theme}>
            <SettingsRow
              theme={theme}
              icon={Lock}
              label={t('profile.danger.lock')}
              onPress={onLock}
            />
            <SettingsRow
              theme={theme}
              icon={LogOut}
              label={t('profile.danger.signOut')}
              danger
              onPress={onSignOut}
              last
            />
          </SettingsSection>
        </ScrollView>
      </View>
    </WalletBackground>
  );
}

/** Number of distinct chains the user's wallets can transact on. */
function countActiveNetworks(wallets: ReturnType<typeof useWalletState>['wallets']): number {
  const chains = new Set<string>();
  for (const wallet of wallets) {
    for (const chain of wallet.chains) {
      chains.add(chain);
    }
  }
  return chains.size;
}
