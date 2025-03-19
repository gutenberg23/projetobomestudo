import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			fontFamily: {
				sans: ['Inter', 'sans-serif'],
			},
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: '#5f2ebe',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				}
			},
			typography: {
				DEFAULT: {
					css: {
						color: '#67748a', // Cor padrão para texto
						maxWidth: '100%',
						a: {
							color: '#ea2be2', // Tom principal (roxo/magenta)
							textDecoration: 'underline',
							fontWeight: '500',
							'&:hover': {
								color: '#5f2ebe', // Hover com cor secundária
							},
						},
						h1: {
							color: '#272f3c', // Cor para títulos
							fontWeight: '700',
							fontSize: '2.25rem',
							marginTop: '2rem',
							marginBottom: '1rem',
						},
						h2: {
							color: '#272f3c',
							fontWeight: '600',
							fontSize: '1.75rem',
							marginTop: '1.75rem',
							marginBottom: '0.75rem',
						},
						h3: {
							color: '#272f3c',
							fontWeight: '600',
							fontSize: '1.5rem',
							marginTop: '1.5rem',
							marginBottom: '0.75rem',
						},
						h4: {
							color: '#272f3c',
							fontWeight: '600',
							fontSize: '1.25rem',
						},
						blockquote: {
							fontStyle: 'italic',
							color: '#67748a',
							borderLeftColor: '#5f2ebe',
							borderLeftWidth: '4px',
							paddingLeft: '1rem',
							backgroundColor: '#f8f9fa',
							borderRadius: '0.25rem',
							padding: '1rem',
						},
						'ul > li': {
							position: 'relative',
							paddingLeft: '1.75em',
							'&::before': {
								content: '""',
								position: 'absolute',
								backgroundColor: '#5f2ebe',
								borderRadius: '50%',
								width: '0.375em',
								height: '0.375em',
								top: 'calc(0.875em - 0.1875em)',
								left: '0.25em',
							},
						},
						'ol > li': {
							position: 'relative',
							paddingLeft: '1.75em',
							counterIncrement: 'list-counter',
							'&::before': {
								content: 'counter(list-counter) "."',
								position: 'absolute',
								fontWeight: '500',
								color: '#5f2ebe',
								left: '0',
							},
						},
						img: {
							borderRadius: '0.5rem',
							marginTop: '1.5rem',
							marginBottom: '1.5rem',
						},
						table: {
							width: '100%',
							borderCollapse: 'collapse',
							borderSpacing: 0,
							marginTop: '1.5rem',
							marginBottom: '1.5rem',
						},
						'thead th': {
							borderBottom: '2px solid #e2e8f0',
							padding: '0.75rem',
							textAlign: 'left',
							color: '#272f3c',
							fontWeight: '600',
							backgroundColor: '#f8f9fa',
						},
						'tbody td': {
							padding: '0.75rem',
							borderBottom: '1px solid #e2e8f0',
							color: '#67748a',
						},
						'tbody tr:last-child td': {
							borderBottom: 'none',
						},
						code: {
							color: '#5f2ebe',
							backgroundColor: '#f1f5f9',
							padding: '0.2em 0.4em',
							borderRadius: '0.25rem',
							fontSize: '0.875em',
						},
						pre: {
							backgroundColor: '#1e293b',
							color: '#f8fafc',
							padding: '1rem',
							borderRadius: '0.5rem',
							overflowX: 'auto',
							fontSize: '0.875em',
						},
						'pre code': {
							backgroundColor: 'transparent',
							color: 'inherit',
							fontSize: 'inherit',
							padding: '0',
						},
					},
				},
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out'
			}
		}
	},
	plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
} satisfies Config;
