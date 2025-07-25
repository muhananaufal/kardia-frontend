/** @type {import('tailwindcss').Config} */
module.exports = {
	theme: {
		// tailwind.config.js

		colors: {
			// Warna dasar
			transparent: 'transparent',
			current: 'currentColor',
			black: '#000',
			white: '#fff',

			// Palet warna standar Tailwind dengan HSL (sintaks koma)
			gray: {
				50: 'hsl(220, 13%, 96.1%)',
				100: 'hsl(220, 13%, 91%)',
				200: 'hsl(220, 13%, 82.9%)',
				300: 'hsl(217.1, 12.3%, 69.8%)',
				400: 'hsl(218.2, 9.1%, 56.1%)',
				500: 'hsl(220, 8.9%, 46.1%)',
				600: 'hsl(215, 13.8%, 34.1%)',
				700: 'hsl(215, 19.3%, 25.1%)',
				800: 'hsl(215, 25.3%, 18.8%)',
				900: 'hsl(215, 27.9%, 16.9%)',
				950: 'hsl(216, 34.1%, 11.4%)',
			},
			slate: {
				50: 'hsl(210, 40%, 98%)',
				100: 'hsl(210, 40%, 96.1%)',
				200: 'hsl(214.3, 31.8%, 91.4%)',
				300: 'hsl(215.4, 25.2%, 83.1%)',
				400: 'hsl(215.3, 19.3%, 69.2%)',
				500: 'hsl(215.4, 16.3%, 46.9%)',
				600: 'hsl(215, 20.2%, 34.1%)',
				700: 'hsl(215, 27.6%, 25.1%)',
				800: 'hsl(217.2, 32.6%, 17.5%)',
				900: 'hsl(222.2, 47.4%, 11.2%)',
				950: 'hsl(222.2, 84%, 4.9%)',
			},
			blue: {
				50: 'hsl(210, 100%, 98%)',
				100: 'hsl(211.1, 100%, 96.3%)',
				200: 'hsl(211.7, 96.5%, 91.2%)',
				300: 'hsl(210.4, 92.1%, 83.1%)',
				400: 'hsl(211.8, 91.3%, 72.9%)',
				500: 'hsl(217.2, 91.2%, 59.8%)',
				600: 'hsl(221.2, 83.2%, 53.3%)',
				700: 'hsl(224.3, 76.3%, 48%)',
				800: 'hsl(226.3, 70.6%, 41.2%)',
				900: 'hsl(223.9, 69.1%, 36.5%)',
				950: 'hsl(224.1, 66.7%, 21.8%)',
			},
			emerald: {
				50: 'hsl(158.1, 86.5%, 97.5%)',
				100: 'hsl(158.2, 77.4%, 94.7%)',
				200: 'hsl(157.6, 69.1%, 87.5%)',
				300: 'hsl(157.6, 57.2%, 77.1%)',
				400: 'hsl(157.9, 44.1%, 61.2%)',
				500: 'hsl(158, 85.8%, 37.5%)',
				600: 'hsl(159.8, 88.7%, 29.8%)',
				700: 'hsl(161.4, 95.1%, 23.3%)',
				800: 'hsl(162.2, 97.4%, 18.2%)',
				900: 'hsl(162.9, 97.6%, 14.9%)',
				950: 'hsl(163.6, 97.1%, 9%)',
			},
			green: {
				50: 'hsl(140, 75%, 97.8%)',
				100: 'hsl(139.6, 66.7%, 95.5%)',
				200: 'hsl(139.7, 62.5%, 90.6%)',
				300: 'hsl(140.4, 56.9%, 80.6%)',
				400: 'hsl(141.2, 46.8%, 65.5%)',
				500: 'hsl(142.1, 76.2%, 36.3%)',
				600: 'hsl(142.1, 66.7%, 30.8%)',
				700: 'hsl(142.6, 60.3%, 26.5%)',
				800: 'hsl(143.2, 55%, 22.9%)',
				900: 'hsl(143.5, 52.4%, 20%)',
				950: 'hsl(144.1, 55.6%, 12.5%)',
			},
			indigo: {
				50: 'hsl(225.9, 100%, 97.5%)',
				100: 'hsl(225.6, 94.3%, 92.7%)',
				200: 'hsl(226.1, 89.8%, 86.1%)',
				300: 'hsl(227.1, 84.6%, 77.5%)',
				400: 'hsl(230, 81.3%, 66.5%)',
				500: 'hsl(231.1, 89.3%, 60.2%)',
				600: 'hsl(235.1, 81.9%, 56.3%)',
				700: 'hsl(239.1, 75.8%, 51%)',
				800: 'hsl(242.2, 68.9%, 45.9%)',
				900: 'hsl(243.3, 64.9%, 39.8%)',
				950: 'hsl(244.5, 58.3%, 26.9%)',
			},
			orange: {
				50: 'hsl(45, 100%, 97.6%)',
				100: 'hsl(42.4, 96.9%, 94.7%)',
				200: 'hsl(39.1, 94.3%, 88.8%)',
				300: 'hsl(34.8, 93.9%, 79.4%)',
				400: 'hsl(29.6, 95.6%, 65.3%)',
				500: 'hsl(29.9, 95.8%, 59.2%)',
				600: 'hsl(25.9, 94.8%, 54.1%)',
				700: 'hsl(23.3, 91.3%, 49.6%)',
				800: 'hsl(21.3, 87.3%, 44.5%)',
				900: 'hsl(21.6, 84.1%, 37.5%)',
				950: 'hsl(21.9, 83.3%, 24.1%)',
			},
			red: {
				50: 'hsl(0, 100%, 97.8%)',
				100: 'hsl(0, 88.9%, 95.5%)',
				200: 'hsl(0, 88.9%, 90.6%)',
				300: 'hsl(0, 89.3%, 83.7%)',
				400: 'hsl(0, 92.2%, 71%)',
				500: 'hsl(0, 84.2%, 60.2%)',
				600: 'hsl(0, 72.2%, 50.6%)',
				700: 'hsl(0, 73.6%, 42.2%)',
				800: 'hsl(0, 72.1%, 35.1%)',
				900: 'hsl(0, 62.8%, 30.6%)',
				950: 'hsl(0, 66.7%, 17.1%)',
			},
			rose: {
				50: 'hsl(350, 100%, 98%)',
				100: 'hsl(350.6, 88.9%, 95.5%)',
				200: 'hsl(350.4, 89.8%, 90.2%)',
				300: 'hsl(349.5, 87.2%, 82.2%)',
				400: 'hsl(347.4, 90.5%, 71%)',
				500: 'hsl(346.8, 89.6%, 59.8%)',
				600: 'hsl(348.1, 78.8%, 49.4%)',
				700: 'hsl(346.8, 83.1%, 41.2%)',
				800: 'hsl(346.2, 83.5%, 34.9%)',
				900: 'hsl(345.3, 74.2%, 29.8%)',
				950: 'hsl(344.3, 88.5%, 16.3%)',
			},
			sky: {
				50: 'hsl(204, 100%, 97.5%)',
				100: 'hsl(204, 94.7%, 94.7%)',
				200: 'hsl(203.4, 93.9%, 88.8%)',
				300: 'hsl(202.4, 91.5%, 79.8%)',
				400: 'hsl(200.4, 93.5%, 66.5%)',
				500: 'hsl(206.5, 95.7%, 55.3%)',
				600: 'hsl(208.2, 92.4%, 51.2%)',
				700: 'hsl(208.9, 88.5%, 44.9%)',
				800: 'hsl(209.3, 83.1%, 37.5%)',
				900: 'hsl(209.7, 78%, 32%)',
				950: 'hsl(210.7, 76.9%, 21%)',
			},
			violet: {
				50: 'hsl(251.1, 100%, 97.8%)',
				100: 'hsl(251.6, 94.7%, 95.1%)',
				200: 'hsl(251.6, 90.2%, 88.8%)',
				300: 'hsl(251.9, 87.4%, 80.8%)',
				400: 'hsl(251.9, 94.5%, 72.9%)',
				500: 'hsl(252.3, 94.9%, 66.9%)',
				600: 'hsl(254.1, 91.2%, 62.9%)',
				700: 'hsl(255.8, 86.4%, 58.8%)',
				800: 'hsl(257.4, 78.1%, 54.1%)',
				900: 'hsl(258.9, 72.8%, 48.6%)',
				950: 'hsl(261.2, 73.1%, 30.2%)',
			},
			yellow: {
				50: 'hsl(54, 100%, 98.6%)',
				100: 'hsl(55.2, 100%, 96.5%)',
				200: 'hsl(54.9, 95.8%, 90.4%)',
				300: 'hsl(52.7, 93.9%, 80.8%)',
				400: 'hsl(49.6, 95.2%, 67.5%)',
				500: 'hsl(45.4, 93.4%, 58.8%)',
				600: 'hsl(40.6, 87.2%, 51.4%)',
				700: 'hsl(36.4, 82%, 45.7%)',
				800: 'hsl(34.2, 77.8%, 39.4%)',
				900: 'hsl(33.6, 74.4%, 34.1%)',
				950: 'hsl(33.8, 77.8%, 20.6%)',
			},

			// Warna kustom dari tema gelap Anda (dikonversi dari OKLCH)
			chart: {
				1: 'hsl(264.4, 83.1%, 54.9%)',
				2: 'hsl(162.5, 50.1%, 65.1%)',
				3: 'hsl(70.1, 66.4%, 69.4%)',
				4: 'hsl(303.9, 83.3%, 65.5%)',
				5: 'hsl(16.4, 89.2%, 59%)',
			},
			sidebar: {
				DEFAULT: 'hsl(0, 0%, 20.5%)',
				foreground: 'hsl(0, 0%, 98.5%)',
				primary: 'hsl(264.4, 83.1%, 54.9%)',
				'primary-foreground': 'hsl(0, 0%, 98.5%)',
				accent: 'hsl(0, 0%, 26.9%)',
				'accent-foreground': 'hsl(0, 0%, 98.5%)',
				border: 'hsl(0, 0%, 100%, 0.1)', // Alpha value
				ring: 'hsl(0, 0%, 55.6%)',
			},
		},
	},
	plugins: [],
};
