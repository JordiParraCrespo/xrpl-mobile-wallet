import type React from "react";
import AccordionScreen from "./accordion";
import ActionButtonScreen from "./action-button";
import AddressPillScreen from "./address-pill";
import AlertScreen from "./alert";
import AlertDialogScreen from "./alert-dialog";
import AmountDisplayScreen from "./amount-display";
import AmountTextScreen from "./amount-text";
import AspectRatioScreen from "./aspect-ratio";
import AssetIconScreen from "./asset-icon";
import AssistantAvatarScreen from "./assistant-avatar";
import AvatarScreen from "./avatar";
import BadgeScreen from "./badge";
import ButtonScreen from "./button";
import CalloutScreen from "./callout";
import CardScreen from "./card";
import ChainBadgeScreen from "./chain-badge";
import ChatMessageScreen from "./chat-message";
import CheckboxScreen from "./checkbox";
import ChipScreen from "./chip";
import CollapsibleScreen from "./collapsible";
import ColorsScreen from "./colors";
import ContextMenuScreen from "./context-menu";
import DetailListScreen from "./detail-list";
import DialogScreen from "./dialog";
import DropdownMenuScreen from "./dropdown-menu";
import FeatureRowScreen from "./feature-row";
import HoverCardScreen from "./hover-card";
import IconButtonScreen from "./icon-button";
import IconsScreen from "./icons";
import ImportMethodCardScreen from "./import-method-card";
import InitialsAvatarScreen from "./initials-avatar";
import InputScreen from "./input";
import InputFieldScreen from "./input-field";
import KeypadScreen from "./keypad";
import LabelScreen from "./label";
import ListRowScreen from "./list-row";
import MenuRowScreen from "./menu-row";
import MenubarScreen from "./menubar";
import MnemonicGridScreen from "./mnemonic-grid";
import NotificationRowScreen from "./notification-row";
import PopoverScreen from "./popover";
import PriceChangeScreen from "./price-change";
import ProgressScreen from "./progress";
import RadioGroupScreen from "./radio-group";
import ScreenHeaderScreen from "./screen-header";
import SegmentedControlScreen from "./segmented-control";
import SelectScreen from "./select";
import SelectorPillScreen from "./selector-pill";
import SeparatorScreen from "./separator";
import SessionRowScreen from "./session-row";
import SkeletonScreen from "./skeleton";
import SparklineScreen from "./sparkline";
import SuccessTickScreen from "./success-tick";
import SwitchScreen from "./switch";
import TabBarScreen from "./tab-bar";
import TabsScreen from "./tabs";
import TextScreen from "./text";
import TextareaScreen from "./textarea";
import ToastScreen from "./toast";
import ToggleScreen from "./toggle";
import ToggleGroupScreen from "./toggle-group";
import TooltipScreen from "./tooltip";
import TypographyScreen from "./typography";

export const REGISTRY: Record<string, React.ComponentType> = {
  accordion: AccordionScreen,
  "action-button": ActionButtonScreen,
  "address-pill": AddressPillScreen,
  alert: AlertScreen,
  "alert-dialog": AlertDialogScreen,
  "amount-display": AmountDisplayScreen,
  "amount-text": AmountTextScreen,
  "aspect-ratio": AspectRatioScreen,
  "asset-icon": AssetIconScreen,
  "assistant-avatar": AssistantAvatarScreen,
  avatar: AvatarScreen,
  badge: BadgeScreen,
  button: ButtonScreen,
  callout: CalloutScreen,
  card: CardScreen,
  "chain-badge": ChainBadgeScreen,
  "chat-message": ChatMessageScreen,
  checkbox: CheckboxScreen,
  chip: ChipScreen,
  collapsible: CollapsibleScreen,
  colors: ColorsScreen,
  "context-menu": ContextMenuScreen,
  "detail-list": DetailListScreen,
  dialog: DialogScreen,
  "dropdown-menu": DropdownMenuScreen,
  "feature-row": FeatureRowScreen,
  "hover-card": HoverCardScreen,
  "icon-button": IconButtonScreen,
  icons: IconsScreen,
  "import-method-card": ImportMethodCardScreen,
  "initials-avatar": InitialsAvatarScreen,
  input: InputScreen,
  "input-field": InputFieldScreen,
  keypad: KeypadScreen,
  label: LabelScreen,
  "list-row": ListRowScreen,
  "menu-row": MenuRowScreen,
  menubar: MenubarScreen,
  "mnemonic-grid": MnemonicGridScreen,
  "notification-row": NotificationRowScreen,
  popover: PopoverScreen,
  "price-change": PriceChangeScreen,
  progress: ProgressScreen,
  "radio-group": RadioGroupScreen,
  "screen-header": ScreenHeaderScreen,
  "segmented-control": SegmentedControlScreen,
  select: SelectScreen,
  "selector-pill": SelectorPillScreen,
  separator: SeparatorScreen,
  "session-row": SessionRowScreen,
  skeleton: SkeletonScreen,
  sparkline: SparklineScreen,
  "success-tick": SuccessTickScreen,
  switch: SwitchScreen,
  "tab-bar": TabBarScreen,
  tabs: TabsScreen,
  text: TextScreen,
  textarea: TextareaScreen,
  toast: ToastScreen,
  toggle: ToggleScreen,
  "toggle-group": ToggleGroupScreen,
  tooltip: TooltipScreen,
  typography: TypographyScreen,
};
