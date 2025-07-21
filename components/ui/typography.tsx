import React from 'react';
import { cn } from '@/lib/utils';

// Typography variants with consistent styling
export const typographyVariants = {
  // Display text - large, prominent headings
  display: {
    '4xl': 'text-4xl font-bold leading-tight tracking-tight',
    '3xl': 'text-3xl font-bold leading-tight tracking-tight',
    '2xl': 'text-2xl font-bold leading-tight tracking-tight',
    xl: 'text-xl font-bold leading-tight tracking-tight',
  },
  
  // Heading text - section titles
  heading: {
    h1: 'text-4xl font-bold leading-tight tracking-tight',
    h2: 'text-3xl font-semibold leading-tight tracking-tight',
    h3: 'text-2xl font-semibold leading-tight tracking-tight',
    h4: 'text-xl font-semibold leading-tight tracking-tight',
    h5: 'text-lg font-semibold leading-tight tracking-tight',
    h6: 'text-base font-semibold leading-tight tracking-tight',
  },
  
  // Body text - main content
  body: {
    lg: 'text-lg leading-relaxed',
    base: 'text-base leading-relaxed',
    sm: 'text-sm leading-relaxed',
    xs: 'text-xs leading-relaxed',
  },
  
  // Caption text - small, secondary information
  caption: {
    base: 'text-sm leading-normal text-muted-foreground',
    sm: 'text-xs leading-normal text-muted-foreground',
  },
  
  // Label text - form labels, buttons
  label: {
    lg: 'text-lg font-medium leading-tight',
    base: 'text-base font-medium leading-tight',
    sm: 'text-sm font-medium leading-tight',
    xs: 'text-xs font-medium leading-tight',
  },
  
  // Code text - monospace for technical content
  code: {
    lg: 'text-lg font-mono leading-tight',
    base: 'text-base font-mono leading-tight',
    sm: 'text-sm font-mono leading-tight',
    xs: 'text-xs font-mono leading-tight',
  },
} as const;

// Typography component props
export interface TypographyProps extends React.HTMLAttributes<HTMLElement> {
  variant?: keyof typeof typographyVariants;
  size?: string;
  as?: React.ElementType;
  children: React.ReactNode;
  className?: string;
}

// Typography Component
export const Typography = React.forwardRef<HTMLElement, TypographyProps>(
  ({ variant = 'body', size = 'base', as, className, children, ...props }, ref) => {
    const Component = as || 'div';
    const variantStyles = typographyVariants[variant];
    const sizeStyles = variantStyles[size as keyof typeof variantStyles] || (variantStyles as any).base;
    
    return (
      <Component
        ref={ref}
        className={cn(sizeStyles, className)}
        {...props}
      >
        {children}
      </Component>
    );
  }
);

Typography.displayName = 'Typography';

// Convenience components for common typography patterns
export const Display = React.forwardRef<HTMLHeadingElement, Omit<TypographyProps, 'variant'>>(
  (props, ref) => <Typography variant="display" ref={ref} {...props} />
);
Display.displayName = 'Display';

export const Heading = React.forwardRef<HTMLHeadingElement, Omit<TypographyProps, 'variant'>>(
  (props, ref) => <Typography variant="heading" ref={ref} {...props} />
);
Heading.displayName = 'Heading';

export const Body = React.forwardRef<HTMLParagraphElement, Omit<TypographyProps, 'variant'>>(
  (props, ref) => <Typography variant="body" ref={ref} {...props} />
);
Body.displayName = 'Body';

export const Caption = React.forwardRef<HTMLSpanElement, Omit<TypographyProps, 'variant'>>(
  (props, ref) => <Typography variant="caption" ref={ref} {...props} />
);
Caption.displayName = 'Caption';

export const Label = React.forwardRef<HTMLLabelElement, Omit<TypographyProps, 'variant'>>(
  (props, ref) => <Typography variant="label" ref={ref} {...props} />
);
Label.displayName = 'Label';

export const Code = React.forwardRef<HTMLElement, Omit<TypographyProps, 'variant'>>(
  (props, ref) => <Typography variant="code" ref={ref} {...props} />
);
Code.displayName = 'Code';

// Specific heading components
export const H1 = React.forwardRef<HTMLHeadingElement, Omit<TypographyProps, 'variant' | 'size'>>(
  (props, ref) => <Typography variant="heading" size="h1" as="h1" ref={ref} {...props} />
);
H1.displayName = 'H1';

export const H2 = React.forwardRef<HTMLHeadingElement, Omit<TypographyProps, 'variant' | 'size'>>(
  (props, ref) => <Typography variant="heading" size="h2" as="h2" ref={ref} {...props} />
);
H2.displayName = 'H2';

export const H3 = React.forwardRef<HTMLHeadingElement, Omit<TypographyProps, 'variant' | 'size'>>(
  (props, ref) => <Typography variant="heading" size="h3" as="h3" ref={ref} {...props} />
);
H3.displayName = 'H3';

export const H4 = React.forwardRef<HTMLHeadingElement, Omit<TypographyProps, 'variant' | 'size'>>(
  (props, ref) => <Typography variant="heading" size="h4" as="h4" ref={ref} {...props} />
);
H4.displayName = 'H4';

export const H5 = React.forwardRef<HTMLHeadingElement, Omit<TypographyProps, 'variant' | 'size'>>(
  (props, ref) => <Typography variant="heading" size="h5" as="h5" ref={ref} {...props} />
);
H5.displayName = 'H5';

export const H6 = React.forwardRef<HTMLHeadingElement, Omit<TypographyProps, 'variant' | 'size'>>(
  (props, ref) => <Typography variant="heading" size="h6" as="h6" ref={ref} {...props} />
);
H6.displayName = 'H6';

// Paragraph components
export const P = React.forwardRef<HTMLParagraphElement, Omit<TypographyProps, 'variant' | 'size'>>(
  (props, ref) => <Typography variant="body" size="base" as="p" ref={ref} {...props} />
);
P.displayName = 'P';

export const Small = React.forwardRef<HTMLSpanElement, Omit<TypographyProps, 'variant' | 'size'>>(
  (props, ref) => <Typography variant="body" size="sm" as="span" ref={ref} {...props} />
);
Small.displayName = 'Small';

// Utility function to get typography classes
export const getTypographyClasses = (variant: keyof typeof typographyVariants, size: string) => {
  const variantStyles = typographyVariants[variant];
  return variantStyles[size as keyof typeof variantStyles] || (variantStyles as any).base;
}; 