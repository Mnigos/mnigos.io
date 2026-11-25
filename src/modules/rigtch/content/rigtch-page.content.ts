import { PROFILE } from '../../profile/content/profile.content'
import listeningDaysWide from './screenshots/listening-days-wide.webp'
import listeningDays from './screenshots/listening-days.webp'
import sharedTopArtist from './screenshots/shared-top-artist.webp'
import topArtists from './screenshots/top-artists.webp'

export const RIGTCH_PAGE = {
	title: 'rigtch.fm · mnigos',
	description:
		'rigtch.fm, Spotify listening stats available all year. What it does, its history and stack, built and run solo by Igor Makowski.',
	openProduct: `Open ${PROFILE.product.name}`,
	screenshots: [
		{
			image: listeningDays,
			wide: listeningDaysWide,
			alt: "Igor's weekly rigtch.fm report for Nov 16 to Nov 22, comparing daily listening time to last week, with Nov 18 as the most listened day",
		},
		{
			image: topArtists,
			alt: "The Top Artists list on Igor's rigtch.fm profile, showing listening time per artist over the last three months",
		},
		{
			image: sharedTopArtist,
			alt: "A rigtch.fm portrait share card for Igor's top artist of the last three months, Sargeist, with 11h 0m listened",
		},
	],
	whatItDoes: {
		heading: 'What it does',
		features: [
			{
				title: 'Top artists, tracks, albums and genres',
				text: 'Ranked by plays or listening time, over ranges from the last week to all time.',
			},
			{
				title: 'Full history import',
				text: 'Listeners upload their extended Spotify history export to load every play since opening their account.',
			},
			{
				title: 'Listening reports',
				text: 'Weekly, monthly and yearly summaries of listening activity.',
			},
			{
				title: 'Images to share',
				text: 'Any ranking can be downloaded as a portrait image card for stories and posts.',
			},
			{
				title: 'Leaderboard',
				text: 'Listeners ranked by total plays, listening time, discovery rate and active streak.',
			},
			{
				title: 'Streak',
				text: 'Consecutive days with at least one play, shown on each profile.',
			},
		],
	},
	whatIDoHeading: 'What I do',
	historyHeading: 'History',
	stack: {
		heading: 'Stack',
		rows: [
			{ label: 'Language', value: 'TypeScript' },
			{ label: 'API', value: 'NestJS on Bun, oRPC' },
			{ label: 'Data', value: 'PostgreSQL' },
			{ label: 'Jobs', value: 'BullMQ' },
			{ label: 'Web', value: 'TanStack Start' },
			{ label: 'Hosting', value: 'Railway' },
		],
	},
	posts: { heading: 'Posts about it', tag: 'rigtch' },
	closingText: 'Connect Spotify to see your own numbers.',
} as const
