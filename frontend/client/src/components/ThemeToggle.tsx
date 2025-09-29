
import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/contexts/ThemeContext';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className="relative w-9 h-9 rounded-lg transition-all duration-300 hover:bg-accent/50"
      aria-label={`Alternar para tema ${theme === 'light' ? 'escuro' : 'claro'}`}
    >
      <Sun className={`h-4 w-4 absolute transition-all duration-500 ${
        theme === 'dark' 
          ? 'rotate-90 scale-0 opacity-0' 
          : 'rotate-0 scale-100 opacity-100'
      }`} />
      <Moon className={`h-4 w-4 absolute transition-all duration-500 ${
        theme === 'light' 
          ? '-rotate-90 scale-0 opacity-0' 
          : 'rotate-0 scale-100 opacity-100'
      }`} />
    </Button>
  );
}
