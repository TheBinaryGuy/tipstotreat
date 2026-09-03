import type { EntryKind, Ingredient } from '@/lib/db/schema';

/**
 * SYNTHETIC SAMPLE CONTENT.
 * These entries exist so the site has something to render before the author
 * writes her own. They are seeded as published entries by `pnpm db:seed:local`
 * and should be deleted or rewritten from the admin panel before launch.
 */
export type SampleEntry = {
    slug: string;
    kind: EntryKind;
    title: string;
    useFor?: string;
    summary: string;
    /** Markdown. */
    body: string;
    ingredients: Ingredient[];
    steps: string[];
    tags: string[];
    caution?: string;
    prepMinutes?: number;
    cookMinutes?: number;
    servings?: string;
    /** Days ago, so the newest sample is always the newest entry. */
    publishedDaysAgo: number;
};

export const sampleEntries: SampleEntry[] = [
    {
        slug: 'haldi-doodh-for-a-dry-cough',
        kind: 'remedy',
        title: 'Haldi doodh for a dry cough',
        useFor: 'Dry cough, scratchy throat',
        summary:
            'Warm milk with a pinch of turmeric and black pepper, taken at bedtime. Two nights usually settle a tickly cough.',
        body: 'This is the first thing I make when anyone in the house starts coughing at night. Turmeric is soothing, the pepper helps the body take it in, and the warm milk coats the throat so you can sleep.\n\n## Why it works\n\nThe warmth alone loosens a dry throat. Turmeric (haldi) has been used for inflammation in every Indian kitchen for as long as anyone remembers, and a pinch of black pepper is the traditional partner because it helps the turmeric do its work.\n\n## My notes\n\n- Use fresh turmeric if you have it: a small grated piece instead of powder.\n- Children over two can have half a cup with a smaller pinch of turmeric and no pepper.\n- Do not add sugar; a little jaggery is fine if the taste bothers you.',
        ingredients: [
            { name: 'Milk', quantity: '1 cup' },
            { name: 'Turmeric powder', quantity: '¼ tsp' },
            { name: 'Black pepper, crushed', quantity: 'a pinch' },
            { name: 'Jaggery (optional)', quantity: 'a small piece' },
        ],
        steps: [
            'Warm the milk in a small pan until it steams. Do not boil it.',
            'Stir in the turmeric and crushed pepper.',
            'Pour into a cup, add jaggery if using, and sip slowly while it is warm.',
            'Take it just before bed for two or three nights.',
        ],
        tags: ['cough', 'throat', 'winter', 'bedtime'],
        caution:
            'If the cough lasts more than ten days, comes with fever, breathlessness, or blood, see a doctor. Skip this if you are allergic to dairy or have gallstones.',
        publishedDaysAgo: 1,
    },
    {
        slug: 'ajwain-water-for-acidity',
        kind: 'remedy',
        title: 'Ajwain water for acidity and bloating',
        useFor: 'Acidity, bloating, heavy stomach',
        summary:
            'A teaspoon of carom seeds boiled in water and sipped warm after a heavy meal. Relief within half an hour.',
        body: 'Ajwain is the small brown seed in every masala dabba that smells like thyme. My mother gave it to us with a pinch of salt after every wedding feast, and I still do the same.\n\n## Why it works\n\nAjwain settles the stomach and helps trapped gas move. Boiling it makes it gentler than chewing the raw seeds.\n\n## My notes\n\n- Chewing half a teaspoon of ajwain with a pinch of black salt works faster, but it is strong.\n- Keep a small jar of roasted ajwain in the kitchen for guests who overeat.',
        ingredients: [
            { name: 'Carom seeds', quantity: '1 tsp' },
            { name: 'Water', quantity: '1½ cups' },
            { name: 'Black salt', quantity: 'a pinch' },
        ],
        steps: [
            'Boil the water with the ajwain for five minutes until it turns pale brown.',
            'Strain into a cup and add the black salt.',
            'Sip warm, slowly, half an hour after eating.',
        ],
        tags: ['digestion', 'acidity', 'gas', 'after meals'],
        caution:
            'Not for pregnant women in large amounts. If you have burning pain that wakes you at night or lasts more than two weeks, get it checked.',
        publishedDaysAgo: 4,
    },
    {
        slug: 'ghee-and-honey-for-cracked-heels',
        kind: 'remedy',
        title: 'Ghee for cracked heels',
        useFor: 'Cracked, dry heels',
        summary:
            'Warm ghee rubbed into clean heels at night, with cotton socks over it. A week of this and the cracks close.',
        body: 'Winter in a house with stone floors means cracked heels. Creams from the shop help for a day; ghee helps for good, as long as you keep at it.\n\n## My notes\n\n- Soak feet in warm water with a spoon of salt for ten minutes first, then scrub gently with a pumice stone.\n- Old socks you do not mind staining are best.\n- If the cracks bleed, keep them clean and covered and see a doctor before trying anything.',
        ingredients: [
            { name: 'Ghee', quantity: '1 tsp' },
            { name: 'Warm water', quantity: 'a basin' },
            { name: 'Salt', quantity: '1 tbsp' },
        ],
        steps: [
            'Soak your feet in warm salted water for ten minutes and pat dry.',
            'Warm the ghee between your palms and rub it into the heels for a minute.',
            'Put on cotton socks and sleep. Repeat every night for a week.',
        ],
        tags: ['skin', 'winter', 'feet', 'bedtime'],
        caution: 'Diabetics should see a doctor for any foot crack that does not heal in a week.',
        publishedDaysAgo: 9,
    },
    {
        slug: 'tulsi-ginger-kadha',
        kind: 'remedy',
        title: 'Tulsi ginger kadha for a cold',
        useFor: 'Common cold, blocked nose, body ache',
        summary:
            'A strong decoction of tulsi leaves, ginger, and black pepper. One cup, twice a day, on the first day of a cold.',
        body: 'Kadha is what every Indian grandmother makes when the weather changes. It is bitter and it is meant to be. Drink it hot, wrap up, and rest.\n\n## Why it works\n\nGinger warms you and helps with the ache; tulsi and pepper open the nose. Mostly, hot liquid and rest do the healing and the kadha makes you sit still long enough for that.\n\n## My notes\n\n- Fresh tulsi from the pot in the courtyard is best. Dried works in a pinch.\n- Add a small stick of cinnamon if the cough is chesty.\n- Do not make it too strong for children; halve the ginger and pepper.',
        ingredients: [
            { name: 'Tulsi leaves', quantity: '8 to 10' },
            { name: 'Ginger, crushed', quantity: '1 inch' },
            { name: 'Black peppercorns', quantity: '4' },
            { name: 'Cloves', quantity: '2' },
            { name: 'Water', quantity: '2 cups' },
            { name: 'Jaggery', quantity: 'to taste' },
        ],
        steps: [
            'Crush the ginger, peppercorns, and cloves roughly.',
            'Boil everything except the jaggery in the water until it reduces by half.',
            'Strain, stir in jaggery, and drink hot. Twice a day for two days.',
        ],
        tags: ['cold', 'immunity', 'monsoon', 'winter'],
        caution:
            'A cold with high fever, ear pain, or that lasts more than a week needs a doctor. Not a substitute for medicine if you have asthma.',
        publishedDaysAgo: 14,
    },
    {
        slug: 'a-spoon-of-soaked-methi-every-morning',
        kind: 'tip',
        title: 'A spoon of soaked methi every morning',
        useFor: 'Digestion, joint stiffness',
        summary:
            'Soak a teaspoon of fenugreek seeds overnight and swallow them with the water before breakfast.',
        body: 'This is the habit my father kept for forty years. It is bitter for the first week and then you stop noticing.\n\n- Soak the seeds in a small steel katori with just enough water to cover them.\n- Take the water and the seeds together, on an empty stomach.\n- Sprouted methi is milder if the bitterness puts you off.',
        ingredients: [{ name: 'Fenugreek seeds', quantity: '1 tsp' }],
        steps: ['Soak overnight in a covered katori.', 'Swallow with the water before breakfast.'],
        tags: ['morning', 'digestion', 'joints', 'habit'],
        caution:
            'If you take diabetes medicine, tell your doctor before starting; methi can lower sugar.',
        publishedDaysAgo: 6,
    },
    {
        slug: 'keep-a-jar-of-roasted-saunf-by-the-door',
        kind: 'tip',
        title: 'Keep a jar of roasted saunf by the door',
        useFor: 'Fresh breath, after meals',
        summary:
            'Dry-roast fennel seeds with a little mishri and keep the jar where everyone passes. A pinch after every meal.',
        body: 'Every restaurant hands you saunf on the way out. Do the same at home; it settles the stomach and the children love the mishri.\n\n- Roast on a low flame until fragrant, never brown.\n- Mix in a spoon of crushed mishri while the seeds are still warm.',
        ingredients: [
            { name: 'Fennel seeds', quantity: '½ cup' },
            { name: 'Rock sugar, crushed', quantity: '1 tbsp' },
        ],
        steps: [
            'Dry-roast the fennel on a low flame for three minutes.',
            'Cool, mix in the mishri, and jar it.',
        ],
        tags: ['digestion', 'after meals', 'habit'],
        publishedDaysAgo: 12,
    },
    {
        slug: 'moong-dal-khichdi',
        kind: 'recipe',
        title: 'Moong dal khichdi',
        useFor: 'Upset stomach, sick days, light dinners',
        summary:
            'Rice and yellow moong cooked soft with turmeric and ghee. The meal every Indian home makes when someone is unwell.',
        body: 'Khichdi is the first solid food we give babies and the first thing we make when someone is recovering. It should be soft enough to eat with a spoon and plain enough that nobody complains.\n\n## My notes\n\n- For a sick person, skip the tempering and serve with a spoon of ghee and a little salt.\n- For everyone else, add a tadka of cumin, hing, and dried red chilli in ghee at the end.\n- Serve with curd, papad, and a wedge of lime.',
        ingredients: [
            { name: 'Rice', quantity: '½ cup' },
            { name: 'Yellow moong dal', quantity: '½ cup' },
            { name: 'Turmeric', quantity: '½ tsp' },
            { name: 'Salt', quantity: 'to taste' },
            { name: 'Ghee', quantity: '2 tbsp' },
            { name: 'Cumin seeds', quantity: '1 tsp' },
            { name: 'Asafoetida', quantity: 'a pinch' },
            { name: 'Water', quantity: '4 cups' },
        ],
        steps: [
            'Wash the rice and dal together until the water runs clear. Soak for fifteen minutes.',
            'Pressure cook with the water, turmeric, and salt for three whistles. Let the pressure drop on its own.',
            'Heat the ghee, add cumin and hing, and pour over the khichdi.',
            'Stir well. Add hot water if it is thicker than you like; khichdi should be loose.',
        ],
        tags: ['dinner', 'sick day', 'one pot', 'comfort'],
        prepMinutes: 15,
        cookMinutes: 25,
        servings: '3 to 4',
        publishedDaysAgo: 2,
    },
    {
        slug: 'jeera-rice',
        kind: 'recipe',
        title: 'Jeera rice',
        useFor: 'Everyday lunches, with any dal',
        summary:
            'Basmati rice tempered with cumin in ghee. Ten minutes of work and it goes with everything.',
        body: 'This is the rice I make on days when there is dal on the stove and no time for anything else. The trick is to let the cumin crackle properly before the rice goes in.\n\n- Soak the rice for twenty minutes so the grains stay long.\n- Use a wide pan and do not stir more than twice.',
        ingredients: [
            { name: 'Basmati rice', quantity: '1 cup' },
            { name: 'Ghee', quantity: '1 tbsp' },
            { name: 'Cumin seeds', quantity: '1½ tsp' },
            { name: 'Bay leaf', quantity: '1' },
            { name: 'Salt', quantity: '1 tsp' },
            { name: 'Water', quantity: '1¾ cups' },
        ],
        steps: [
            'Wash and soak the rice for twenty minutes. Drain.',
            'Heat the ghee, add cumin and bay leaf, and let the cumin crackle.',
            'Add the rice and fry gently for a minute without breaking the grains.',
            'Add water and salt, bring to a boil, cover, and cook on the lowest flame for twelve minutes.',
            'Rest five minutes, then fluff with a fork.',
        ],
        tags: ['lunch', 'rice', 'quick', 'everyday'],
        prepMinutes: 20,
        cookMinutes: 15,
        servings: '3',
        publishedDaysAgo: 8,
    },
    {
        slug: 'adrak-wali-chai',
        kind: 'recipe',
        title: 'Adrak wali chai',
        useFor: 'Monsoon evenings, a heavy head',
        summary:
            'Strong ginger tea the way it is made in every Indian kitchen: boiled, not steeped.',
        body: 'People ask how Indian chai gets its colour. The answer is patience: the tea leaves boil in water first, and the milk goes in only after.\n\n- Crush the ginger, do not grate it; grated ginger turns the tea bitter.\n- Add a crushed cardamom pod for guests.',
        ingredients: [
            { name: 'Water', quantity: '1 cup' },
            { name: 'Milk', quantity: '1 cup' },
            { name: 'Tea leaves', quantity: '2 tsp' },
            { name: 'Ginger, crushed', quantity: '1 inch' },
            { name: 'Sugar', quantity: 'to taste' },
        ],
        steps: [
            'Boil the water with the crushed ginger for two minutes.',
            'Add the tea leaves and boil until the water turns deep red.',
            'Add the milk and sugar and bring to a rolling boil twice, lifting the pan off between boils.',
            'Strain into cups.',
        ],
        tags: ['tea', 'monsoon', 'evening', 'quick'],
        prepMinutes: 2,
        cookMinutes: 8,
        servings: '2',
        publishedDaysAgo: 18,
    },
];
