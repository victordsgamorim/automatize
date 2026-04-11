'use client';

/**
 * @automatize/ui — Web entry point
 * Re-exports components from src/components/ (visual) and sr./actions/ (behavioral) for web consumers.
 * Only exports what is actively used. New exports are added as features are built.
 */

// Utilities
export { cn } from './utils';

// Components (source of truth: src/components/)
export { Button, buttonVariants } from './components/Button/Button.web';
export { Input } from './components/Input/Input.web';
export type { InputProps } from './components/Input/Input.web';
export { Text } from './components/Text/Text.web';
export type {
  TextProps,
  TextVariant,
  TextColor,
} from './components/Text/Text.web';
export { Checkbox } from './components/Checkbox/Checkbox.web';
export {
  RadioGroup,
  RadioGroupItem,
} from './components/RadioGroup/RadioGroup.web';
export { useToasts, ToastProvider } from './components/Toast/Toast.web';
export type { ToastType } from './components/Toast/Toast.web';
export {
  ErrorBoundary,
  RootErrorBoundary,
} from './actions/ErrorBoundary/ErrorBoundary.web';
export type {
  ErrorBoundaryProps,
  RootErrorBoundaryProps,
} from './actions/ErrorBoundary/ErrorBoundary.web';

export { Fade } from './actions/Fade/Fade.web';
export type { FadeProps } from './actions/Fade/Fade.web';

export {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarTrigger,
  SidebarLink,
  SidebarGroup,
  SidebarNav,
  SidebarLayout,
  useSidebar,
} from './components/Sidebar/Sidebar.web';
export type {
  SidebarProps,
  SidebarLinkProps,
  SidebarNavItem,
  SidebarNavProps,
  SidebarProfileConfig,
  SidebarProfileMenuItem,
  SidebarLayoutProps,
} from './components/Sidebar/Sidebar.web';

export { Card } from './components/Card/Card.web';
export type { CardProps } from './components/Card/Card.web';

export { Separator } from './components/Separator/Separator.web';
export type { SeparatorProps } from './components/Separator/Separator.web';

// Dialog
export {
  Dialog,
  DialogTrigger,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from './components/Dialog/Dialog.web';

// Kbd
export { Kbd } from './components/Kbd/Kbd.web';
export type { KbdProps } from './components/Kbd/Kbd.web';

export {
  Command,
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
  CommandShortcut,
  CommandLoading,
} from './actions/CommandPalette/CommandPalette.web';

export { SearchBar } from './components/SearchBar/SearchBar.web';
export type { SearchBarProps } from './components/SearchBar/SearchBar.web';

// Popover
export {
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverAnchor,
  PopoverClose,
} from './actions/Popover/Popover.web';

// DropdownMenu
export {
  DropdownMenu,
  DropdownMenuPortal,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from './actions/DropdownMenu/DropdownMenu.web';

// Select
export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from './actions/Select/Select.web';

// Calendar
export { Calendar } from './components/Calendar/Calendar.web';
export type { CalendarProps } from './components/Calendar/Calendar.web';

// DateRangePicker
export { DateRangePicker } from './components/DateRangePicker/DateRangePicker.web';
export type { DateRangePickerProps } from './components/DateRangePicker/DateRangePicker.web';

// Re-export DateRange type for consumers
export type { DateRange } from 'react-day-picker';

// Header
export { Header } from './components/Header/Header.web';
export type { HeaderProps } from './components/Header/Header.web';

// BottomNavigation
export { BottomNavigation } from './components/BottomNavigation/BottomNavigation.web';
export type { BottomNavigationProps } from './components/BottomNavigation/BottomNavigation.web';

// Table
export { Table } from './components/Table/Table.web';
export type { TableProps, TableColumn } from './components/Table/Table.web';

// Drawer
export { Drawer } from './components/Drawer/Drawer.web';
export type { DrawerProps } from './components/Drawer/Drawer.web';

// BottomSheet
export { BottomSheet } from './components/BottomSheet/BottomSheet.web';
export type { BottomSheetProps } from './components/BottomSheet/BottomSheet.web';
