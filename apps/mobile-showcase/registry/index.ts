import type React from 'react';
import AccordionScreen from './accordion';
import AlertScreen from './alert';
import AlertDialogScreen from './alert-dialog';
import AspectRatioScreen from './aspect-ratio';
import AvatarScreen from './avatar';
import BadgeScreen from './badge';
import ButtonScreen from './button';
import CardScreen from './card';
import CheckboxScreen from './checkbox';
import CollapsibleScreen from './collapsible';
import ContextMenuScreen from './context-menu';
import DialogScreen from './dialog';
import DropdownMenuScreen from './dropdown-menu';
import HoverCardScreen from './hover-card';
import InputScreen from './input';
import LabelScreen from './label';
import MenubarScreen from './menubar';
import PopoverScreen from './popover';
import ProgressScreen from './progress';
import RadioGroupScreen from './radio-group';
import SelectScreen from './select';
import SeparatorScreen from './separator';
import SkeletonScreen from './skeleton';
import SwitchScreen from './switch';
import TabsScreen from './tabs';
import TextScreen from './text';
import TextareaScreen from './textarea';
import ToggleScreen from './toggle';
import ToggleGroupScreen from './toggle-group';
import TooltipScreen from './tooltip';

export const REGISTRY: Record<string, React.ComponentType> = {
  accordion: AccordionScreen,
  alert: AlertScreen,
  'alert-dialog': AlertDialogScreen,
  'aspect-ratio': AspectRatioScreen,
  avatar: AvatarScreen,
  badge: BadgeScreen,
  button: ButtonScreen,
  card: CardScreen,
  checkbox: CheckboxScreen,
  collapsible: CollapsibleScreen,
  'context-menu': ContextMenuScreen,
  dialog: DialogScreen,
  'dropdown-menu': DropdownMenuScreen,
  'hover-card': HoverCardScreen,
  input: InputScreen,
  label: LabelScreen,
  menubar: MenubarScreen,
  popover: PopoverScreen,
  progress: ProgressScreen,
  'radio-group': RadioGroupScreen,
  select: SelectScreen,
  separator: SeparatorScreen,
  skeleton: SkeletonScreen,
  switch: SwitchScreen,
  tabs: TabsScreen,
  text: TextScreen,
  textarea: TextareaScreen,
  toggle: ToggleScreen,
  'toggle-group': ToggleGroupScreen,
  tooltip: TooltipScreen,
};
