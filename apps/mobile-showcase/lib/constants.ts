type ComponentEntry = { slug: string; name: string };

// Grouped to mirror the Drops components.html gallery sections.
export const SECTIONS: { title: string; items: ComponentEntry[] }[] = [
  {
    title: "Foundations",
    items: [
      { slug: "colors", name: "Colors" },
      { slug: "typography", name: "Typography" },
      { slug: "icons", name: "Icons" },
    ],
  },
  {
    title: "Core",
    items: [
      { slug: "button", name: "Button" },
      { slug: "icon-button", name: "Icon Button" },
      { slug: "badge", name: "Badge" },
      { slug: "chip", name: "Chip" },
      { slug: "card", name: "Card" },
      { slug: "callout", name: "Callout" },
      { slug: "toast", name: "Toast" },
      { slug: "text", name: "Text" },
      { slug: "skeleton", name: "Skeleton" },
      { slug: "separator", name: "Separator" },
      { slug: "progress", name: "Progress" },
    ],
  },
  {
    title: "Forms",
    items: [
      { slug: "input", name: "Input" },
      { slug: "input-field", name: "Input Field" },
      { slug: "textarea", name: "Textarea" },
      { slug: "label", name: "Label" },
      { slug: "switch", name: "Switch" },
      { slug: "checkbox", name: "Checkbox" },
      { slug: "radio-group", name: "Radio Group" },
      { slug: "select", name: "Select" },
      { slug: "segmented-control", name: "Segmented Control" },
      { slug: "tabs", name: "Tabs" },
      { slug: "toggle", name: "Toggle" },
      { slug: "toggle-group", name: "Toggle Group" },
    ],
  },
  {
    title: "Wallet",
    items: [
      { slug: "amount-text", name: "Amount Text" },
      { slug: "amount-display", name: "Amount Display" },
      { slug: "asset-icon", name: "Asset Icon" },
      { slug: "chain-badge", name: "Chain Badge" },
      { slug: "address-pill", name: "Address Pill" },
      { slug: "action-button", name: "Action Button" },
      { slug: "selector-pill", name: "Selector Pill" },
      { slug: "keypad", name: "Keypad" },
      { slug: "list-row", name: "List Row" },
      { slug: "detail-list", name: "Detail List" },
      { slug: "price-change", name: "Price Change" },
      { slug: "sparkline", name: "Sparkline" },
      { slug: "success-tick", name: "Success Tick" },
    ],
  },
  {
    title: "Onboarding",
    items: [
      { slug: "screen-header", name: "Screen Header" },
      { slug: "import-method-card", name: "Import Method Card" },
      { slug: "mnemonic-grid", name: "Mnemonic Grid" },
    ],
  },
  {
    title: "Activity & overlays",
    items: [
      { slug: "notification-row", name: "Notification Row" },
      { slug: "menu-row", name: "Menu Row" },
      { slug: "feature-row", name: "Feature Row" },
      { slug: "dialog", name: "Dialog" },
      { slug: "alert-dialog", name: "Alert Dialog" },
      { slug: "alert", name: "Alert" },
    ],
  },
  {
    title: "Identity",
    items: [
      { slug: "avatar", name: "Avatar" },
      { slug: "initials-avatar", name: "Initials Avatar" },
      { slug: "assistant-avatar", name: "Assistant Avatar" },
    ],
  },
  {
    title: "Assistant",
    items: [
      { slug: "chat-message", name: "Chat Message" },
      { slug: "session-row", name: "Session Row" },
    ],
  },
  {
    title: "Navigation",
    items: [
      { slug: "tab-bar", name: "Tab Bar" },
      { slug: "accordion", name: "Accordion" },
      { slug: "collapsible", name: "Collapsible" },
      { slug: "context-menu", name: "Context Menu" },
      { slug: "dropdown-menu", name: "Dropdown Menu" },
      { slug: "hover-card", name: "Hover Card" },
      { slug: "menubar", name: "Menubar" },
      { slug: "popover", name: "Popover" },
      { slug: "tooltip", name: "Tooltip" },
      { slug: "aspect-ratio", name: "Aspect Ratio" },
    ],
  },
];

export const COMPONENTS: ComponentEntry[] = SECTIONS.flatMap(
  (section) => section.items,
);
