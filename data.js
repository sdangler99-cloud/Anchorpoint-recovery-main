"use strict";

/* ===========================================================
   THEME TOKENS — Vivid / Calming / Modern (no pastels)
=========================================================== */
var THEMES = {
  anchorpoint: {
    name: "Anchorpoint", bg: "#191B1D", bgSoft: "#25282B", card: "#2E3236", cardAlt: "#363B40",
    border: "#4A5056", text: "#F2F2F2", textMuted: "#AEB4B9", primary: "#5FA8C4", primaryText: "#0F1B21",
    secondary: "#8B9096", accent: "#D98A3D", crisisBg: "linear-gradient(90deg,#2E3236,#5FA8C4)",
    crisisText: "#FFFFFF", display: "'Helvetica Neue', system-ui, sans-serif", body: "system-ui, sans-serif"
  },
  vivid: {
    name: "Vivid", bg: "#0B0E14", bgSoft: "#11151F", card: "#161B26", cardAlt: "#1C2230",
    border: "#2A3142", text: "#F5F7FA", textMuted: "#A6AFC0", primary: "#FF3D6E", primaryText: "#FFFFFF",
    secondary: "#00D9C0", accent: "#FFC400", crisisBg: "linear-gradient(90deg,#FF3B30,#FF8A00)",
    crisisText: "#FFFFFF", display: "'Arial Black', system-ui, sans-serif", body: "system-ui, sans-serif"
  },
  calming: {
    name: "Calming", bg: "#0E1B2A", bgSoft: "#122335", card: "#16263A", cardAlt: "#1B2D44",
    border: "#2B435C", text: "#E8F0EE", textMuted: "#9FB6C4", primary: "#3FA796", primaryText: "#06231E",
    secondary: "#6C8EBF", accent: "#C9A227", crisisBg: "linear-gradient(90deg,#1B4332,#2D6A4F)",
    crisisText: "#FFD60A", display: "Georgia, 'Times New Roman', serif", body: "system-ui, sans-serif"
  },
  modern: {
    name: "Modern", bg: "#FAFAFA", bgSoft: "#FFFFFF", card: "#FFFFFF", cardAlt: "#F2F3F5",
    border: "#E3E5E9", text: "#111827", textMuted: "#6B7280", primary: "#2563EB", primaryText: "#FFFFFF",
    secondary: "#111827", accent: "#DC2626", crisisBg: "#111827",
    crisisText: "#FFFFFF", display: "'Helvetica Neue', system-ui, sans-serif", body: "system-ui, sans-serif"
  }
};

/* ===========================================================
   366 NON-REPEATING NIGHTLY JOURNAL TOPICS
=========================================================== */
var TOPIC_BANK = {
  "Recovery": [
    "What does sobriety mean to you today?","Describe one trigger you faced today and how you handled it.",
    "What's one tool from your recovery toolkit you used this week?","Write about a moment today when you chose recovery over an old habit.",
    "What does \"one day at a time\" mean to you right now?","Who in your recovery network can you lean on this week?",
    "What does relapse prevention look like for you today?","Describe a craving you noticed today without acting on it.",
    "What step or principle of your program stood out today?","Write a letter to your future self about staying sober.",
    "What does accountability look like in your life right now?","Describe how your body feels different since getting sober.",
    "What's a recovery milestone you're working toward?","How did you practice honesty with yourself today?",
    "What does surrender mean in your recovery journey?","Write about a meeting, sponsor call, or support conversation you had.",
    "What's one fear about staying sober long-term?","Describe what \"rock bottom\" taught you.",
    "What boundary protected your recovery today?","How do you define a \"good recovery day\"?",
    "What's something about recovery that surprised you?","Write about a time recovery felt hard but you stayed the course.",
    "What does service to others look like for you in recovery?","Describe your relationship with structure and routine.",
    "What's a slogan or saying that keeps you grounded?","How has your definition of fun changed in sobriety?",
    "What does spiritual growth look like for you this week?","Write about a craving you overcame and how.",
    "What does \"progress not perfection\" mean to you today?","Describe a moment you felt proud of your recovery.",
    "What's one thing you're learning about yourself in recovery?","How do you handle boredom without old habits?",
    "What does it mean to forgive yourself in recovery?","Write about your support system and what makes it work.",
    "What's a recovery tool you haven't tried yet but want to?","Describe how your priorities have shifted since getting sober.",
    "What does \"keep it simple\" mean in your daily life?","Write about a time you asked for help in recovery.",
    "What does humility look like for you today?","How do you stay motivated on hard days?",
    "What's something recovery has given you that addiction took away?","Describe a ritual or routine that supports your sobriety.",
    "What does it feel like to trust yourself again?","Write about a moment of gratitude for your sobriety.",
    "What's one thing you'd tell someone just starting recovery?","How do you celebrate small wins in recovery?"
  ],
  "Mental Health": [
    "How would you describe your mood today, and why?","What's one thought pattern you noticed today that wasn't helpful?",
    "Describe a moment of anxiety today and what helped.","What does rest actually look like for you right now?",
    "Write about a feeling you've been avoiding.","What coping skill did you use today?",
    "How does your body feel when you're stressed?","What's something weighing on your mind tonight?",
    "Describe what calm feels like in your body.","What's a thought you want to challenge tonight?",
    "How did you take care of your mental health today?","What does self-compassion sound like in your own voice?",
    "Write about a time you felt truly understood.","What's one thing reflection has taught you lately?",
    "How do you know when you need to slow down?","Describe a moment you felt overwhelmed and what you did next.",
    "What's something you're proud of mentally pushing through today?","Write about your relationship with sleep this week.",
    "What does it feel like when your mind is loud?","How do you talk to yourself when you make a mistake?",
    "What's a worry you can set down for tonight?","Describe a feeling you had today without judging it.",
    "What helps you feel grounded when emotions run high?","Write about a pattern you're trying to change.",
    "What does emotional honesty look like for you?","How did you regulate a strong emotion today?",
    "What's something your mind needed today that it didn't get?","Describe what it feels like to feel safe.",
    "What's a small mental health win from today?","How do you separate your thoughts from facts?",
    "Write about a moment of clarity today.","What does healing feel like lately?",
    "How do you know the difference between rest and avoidance?","What's something you need to grieve or let go of?",
    "Describe how stress shows up in your body.","What's one boundary your mental health needs this week?",
    "How did you show yourself patience today?","What's a thought that kept coming back today?",
    "Write about what peace of mind looks like for you.","How do you recover after a hard emotional moment?",
    "What's something you're learning to sit with instead of fix?","Describe a moment you felt present today.",
    "What does it mean to feel \"enough\" today?","How did your inner critic show up today, and how did you respond?",
    "What's one thing you can do tomorrow for your mental health?","Write about a feeling that surprised you today."
  ],
  "Self-Care": [
    "What's one thing you did today just for you?","Describe your ideal morning routine.",
    "What does your body need more of this week?","Write about a meal that nourished you today.",
    "What's one habit you want to build for your wellbeing?","How did movement show up in your day, big or small?",
    "What's something you need to say no to this week?","Describe a moment of stillness today.",
    "What does \"taking care of yourself\" mean to you right now?","Write about a small comfort that helped today.",
    "What's one thing in your space that needs tidying or care?","How do you recharge after a hard day?",
    "What's a self-care habit you used to skip that you keep now?","Describe how you treated your body today.",
    "What's something you're proud of doing for your health today?","Write about a boundary you set for your own wellbeing.",
    "What does hydration, food, and sleep look like for you today?","What's one thing you'd add to your self-care routine?",
    "How do you know when you need a break?","Describe a moment you chose rest over hustle.",
    "What's something kind you can do for yourself tomorrow?","Write about a hobby or activity that fills your cup.",
    "What does it feel like to slow down on purpose?","How did you protect your energy today?",
    "What's one small luxury you allowed yourself this week?","Describe your relationship with your physical health right now.",
    "What's something you need to forgive your body for?","Write about a self-care practice that didn't work and why.",
    "What does it look like to put yourself first today?","How do you make time for joy in your routine?",
    "What's a sensory experience that calmed you today?","Describe how sunlight or fresh air affected your mood today.",
    "What's one thing your future self will thank you for doing today?","Write about a routine that grounds you.",
    "What does \"enough\" rest look like for your week?","How did you celebrate your body today?",
    "What's a self-care myth you've had to unlearn?","Describe a moment you chose comfort over perfection.",
    "What's one thing you can simplify in your daily routine?","How do you nurture your creativity?",
    "What's a ritual that marks the start or end of your day?","Write about how nature affected your mood this week.",
    "What does balance look like for you right now?","How did you listen to your body's signals today?",
    "What's one act of self-respect you practiced today?","Describe what it means to be gentle with yourself today."
  ],
  "Communication": [
    "Describe a conversation today where you spoke up for yourself.","What's something you need to communicate but haven't yet?",
    "Write about a time you listened more than you spoke today.","How did you handle disagreement today?",
    "What's a boundary you communicated this week?","Describe a moment you chose honesty over avoidance.",
    "What's something you wish you'd said differently today?","How do you ask for help when you need it?",
    "Write about a time you apologized and meant it.","What does active listening look like for you?",
    "Describe a conversation that left you feeling heard.","What's a hard conversation you're avoiding?",
    "How do you express anger in a healthy way?","What's something you need to clarify with someone?",
    "Write about a time you set a boundary and held it.","How do you communicate your needs without guilt?",
    "What's a misunderstanding you cleared up recently?","Describe how you handle feedback or criticism.",
    "What's one thing you appreciate about how someone communicates with you?","How do you stay calm during conflict?",
    "Write about a time silence said more than words.","What's a communication pattern from your past you're trying to change?",
    "How do you check in with someone you care about?","What's something you need to ask for directly?",
    "Describe a time you said no and it felt right.","What does vulnerability in conversation feel like for you?",
    "How do you repair a relationship after a conflict?","Write about a time you advocated for yourself.",
    "What's a word or tone you want to use less often?","How do you know when a conversation needs to happen?",
    "Describe a moment you chose curiosity over judgment.","What's something you need to thank someone for, out loud?",
    "How do you handle being misunderstood?","Write about a conversation you've been rehearsing in your head.",
    "What does respect sound like in conversation?","How do you communicate when you're triggered?",
    "What's a question you wish someone would ask you?","Describe a time you held your tongue and it helped.",
    "How do you give feedback without causing harm?","What's something you need to be more direct about?",
    "Write about how tone affects your conversations.","What's a conversation you're grateful you had?",
    "How do you communicate love or care to others?","What's a pattern of defensiveness you're working on?",
    "Describe a moment you chose connection over being right.","How do you want to be communicated with?"
  ],
  "Relationships": [
    "Write about a relationship that's healing in your life.","What does trust look like with someone close to you right now?",
    "Describe a relationship you're working to repair.","What's something you appreciate about someone in your life today?",
    "How has sobriety changed your relationships?","Write about a friend who shows up for you.",
    "What's a relationship boundary you're proud of holding?","Describe how your relationship with family has shifted.",
    "What's something you need from a relationship right now?","How do you show love to the people you care about?",
    "Write about a relationship you've had to let go of.","What does a healthy relationship look like to you?",
    "Describe a moment of connection you had today.","What's something you're learning about being a partner, parent, or friend?",
    "How do you rebuild trust after it's been broken?","Write about someone who believes in you.",
    "What's a relationship pattern you don't want to repeat?","Describe how you show up for others now versus before.",
    "What's something you need to forgive in a relationship?","How do you balance independence and closeness?",
    "Write about a relationship that challenges you to grow.","What does loyalty mean to you?",
    "Describe a moment someone showed up for you unexpectedly.","What's a relationship you're grateful for tonight?",
    "How do you handle people who aren't supportive of your recovery?","Write about your relationship with your children or family role.",
    "What's something you want to repair with someone this month?","Describe what unconditional support looks like to you.",
    "What's a relationship lesson your journey has taught you?","How do you maintain friendships while protecting your sobriety?",
    "Write about a mentor or role model in your life.","What's something you need to say to someone you've hurt?",
    "Describe a relationship where you feel fully yourself.","What's a way you've grown as a friend or family member?",
    "How do you handle distance in a relationship that matters to you?","Write about a time someone's patience changed you.",
    "What's something you admire about a person close to you?","Describe how your relationship with yourself affects others.",
    "What's a new relationship you'd like to build?","How do you know who deserves your trust?",
    "Write about a relationship that taught you to set boundaries.","What's something you need to release from an old relationship?",
    "Describe a moment of forgiveness, given or received.","What does chosen family mean to you?",
    "How do you show up differently in relationships since getting sober?","Write about a relationship you want to nurture this week."
  ],
  "Looking Back": [
    "What's one thing addiction took from you that you're reclaiming?","Write about a memory you've made peace with.",
    "What's something you've learned from a past mistake?","Describe how far you've come since your hardest days.",
    "What's a lie addiction told you that you no longer believe?","Write about a moment you knew things had to change.",
    "What's something you regret, and what have you done to make amends?","Describe a relationship that's healing since your hardest days.",
    "What's a version of yourself you're grateful you left behind?","Write about the moment you decided to get help.",
    "What's something you're still working to forgive yourself for?","Describe how shame showed up in your past and how you handle it now.",
    "What's a pattern from your past you refuse to repeat?","Write about someone you owe an apology to, and what you'd say.",
    "What's a consequence of addiction that taught you the most?","Describe what hitting your turning point felt like.",
    "What's something you've rebuilt since getting sober?","Write about a fear from your past that no longer controls you.",
    "What's a belief about yourself addiction created that you're unlearning?","Describe how your definition of strength has changed.",
    "What's something you've had to grieve from your past?","Write about a moment of denial you can now see clearly.",
    "What's a wound from your past you're actively healing?","Describe how you've made peace with time you feel you lost.",
    "What's something you're proud you survived?","Write about a person you've forgiven from your past.",
    "What's a habit from your past life you've replaced with something healthier?","Describe what accountability has looked like in repairing the past.",
    "What's something your past self needed to hear?","Write a letter of compassion to who you were a year ago.",
    "What's a memory that used to bring shame that now brings perspective?","Describe how your story has shaped your recovery journey.",
    "What's something you've stopped blaming yourself for?","Write about how you've changed the story you tell about your past.",
    "What's a relationship from your past that taught you who not to be?","Describe a moment you chose growth over guilt.",
    "What's something you needed during your hardest days that you can give yourself now?","Write about how your past has shaped your purpose today.",
    "What's a wall you've broken down since your hardest season?","Describe what closure looks like for a chapter of your past.",
    "What's something you're finally ready to let go of?","Write about the difference between who you were and who you are.",
    "What's a painful memory that's lost its power over you?","Describe how you honor your past without living in it.",
    "What's something your story can offer someone still struggling?","Write about the courage it took to get to today."
  ],
  "Positive Memories": [
    "Describe a memory that always makes you smile.","Write about a moment you felt completely free.",
    "What's a memory with family that you cherish?","Describe a moment you felt proud of yourself.",
    "What's a happy memory from childhood you'd like to revisit?","Write about a trip or place that brought you peace.",
    "What's a memory of laughter you haven't thought about in a while?","Describe a moment someone made you feel truly loved.",
    "What's a memory from early sobriety you're grateful for?","Write about a small moment of joy from this past year.",
    "What's a memory that reminds you who you really are?","Describe a celebration or milestone you'll never forget.",
    "What's a memory with a grandparent, parent, or mentor that shaped you?","Write about a time you felt completely at peace.",
    "What's a memory of accomplishment outside of recovery?","Describe a moment of connection with nature you remember fondly.",
    "What's a memory that reminds you of your strength?","Write about a song, smell, or place that brings back good memories.",
    "What's a memory with your kids or grandkids you treasure?","Describe a time a stranger's kindness stuck with you.",
    "What's a memory of overcoming something hard?","Write about a favorite holiday or tradition memory.",
    "What's a memory that still makes you laugh out loud?","Describe a moment you felt unconditionally accepted.",
    "What's a memory from a hobby or passion that lights you up?","Write about a pet or animal that brought you joy.",
    "What's a memory of feeling safe and at home?","Describe a moment you felt brave.",
    "What's a memory of a friendship that shaped who you are?","Write about your favorite memory from this past month.",
    "What's a memory of a meal shared with people you love?","Describe a moment you felt limitless possibility.",
    "What's a memory tied to music that still moves you?","Write about a moment you felt deeply grateful.",
    "What's your favorite memory of a sibling or sibling figure?","Describe a memory of being outdoors that grounded you.",
    "What's a memory that taught you something about love?","Write about a time you surprised yourself in a good way.",
    "What's your favorite memory from before things got hard?","Describe a moment of pure contentment.",
    "What's a memory that reminds you life is worth living?","Write about a teacher, coach, or mentor's words that stuck with you.",
    "What's a memory of helping someone that felt good?","Describe a moment you felt hope for the first time in a while.",
    "What's a favorite memory you've made since getting sober?","Write about a memory you want to create more of."
  ],
  "Goals": [
    "What's one goal you're working toward this month?","Write about a habit you want to build this year.",
    "What does success look like for you six months from now?","Describe a goal that scares you a little, in a good way.",
    "What's one small step you can take tomorrow toward a bigger goal?","Write about a skill you want to learn in recovery.",
    "What's a financial goal you're working toward?","Describe what your ideal day looks like a year from now.",
    "What's one relationship goal you have?","Write about a career or work goal you're pursuing.",
    "What's a health goal you want to commit to?","Describe a goal you've already accomplished in recovery.",
    "What's something you want to learn more about?","Write about a goal you've had to adjust and why.",
    "What's a creative project you want to start or finish?","Describe what \"thriving\" looks like for you, not just surviving.",
    "What's a goal you've been putting off?","Write about a goal that would make your future self proud.",
    "What's one thing you want to accomplish before the year ends?","Describe a goal related to your family or home life.",
    "What's a goal you have for your mental health?","Write about a dream you haven't given up on.",
    "What's one habit you want to break this year?","Describe a goal that connects to helping others.",
    "What's something you want to be known for?","Write about a goal tied to your education or training.",
    "What's one thing standing between you and a goal, and how will you move past it?","Describe a five-year vision for your life.",
    "What's a goal you can celebrate progress on this week?","Write about a goal related to your sobriety milestones.",
    "What's something you want to give yourself permission to want?","Describe a goal you're working on with someone else's support.",
    "What's one fear holding you back from a goal?","Write about a goal you set just for yourself, no one else.",
    "What's a goal related to your living situation or home?","Describe what \"enough\" looks like for your goals, avoiding burnout.",
    "What's a goal you want to revisit and recommit to?","Write about how your goals have changed since getting sober.",
    "What's one thing you can do this week to move closer to a goal?","Describe a goal that reflects your values, not just achievement.",
    "What's a travel or adventure goal you have?","Write about a goal you want to accomplish with your family.",
    "What's something you're building toward that excites you?","Describe the version of yourself your goals are leading you to become.",
    "What's one goal you're proud to be chasing, even if it's hard?","Write about what you want this next chapter of your life to look like."
  ]
};

function buildTopicDeck() {
  var all = [];
  Object.keys(TOPIC_BANK).forEach(function(cat) {
    TOPIC_BANK[cat].forEach(function(t) { all.push({ category: cat, text: t }); });
  });
  var seed = 19840613;
  function rand() {
    seed = (seed + 0x6d2b79f5) | 0;
    var t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }
  for (var i = all.length - 1; i > 0; i--) {
    var j = Math.floor(rand() * (i + 1));
    var tmp = all[i]; all[i] = all[j]; all[j] = tmp;
  }
  return all.slice(0, 366);
}
var TOPIC_DECK = buildTopicDeck();

function dayOfYear(d) {
  var start = new Date(d.getFullYear(), 0, 0);
  return Math.floor((d - start) / 86400000);
}
function dateKey(d) {
  var y = d.getFullYear();
  var m = String(d.getMonth() + 1).padStart(2, "0");
  var day = String(d.getDate()).padStart(2, "0");
  return y + "-" + m + "-" + day;
}

var QUOTES = [
  ["One day at a time.", "Alcoholics Anonymous saying"],
  ["This too shall pass.", "Persian proverb"],
  ["Progress, not perfection.", "Recovery community saying"],
  ["The journey of a thousand miles begins with a single step.", "Lao Tzu"],
  ["Fall seven times, stand up eight.", "Japanese proverb"],
  ["Out of difficulties grow miracles.", "Jean de La Bruyere"],
  ["What lies behind us and before us are small matters compared to what lies within us.", "Ralph Waldo Emerson"],
  ["Turn your wounds into wisdom.", "Oprah Winfrey"],
  ["You are not your mistakes.", "Recovery community saying"],
  ["Rock bottom became the solid foundation on which I rebuilt my life.", "J.K. Rowling"],
  ["Courage doesn't always roar.", "Mary Anne Radmacher"],
  ["The cave you fear to enter holds the treasure you seek.", "Joseph Campbell"],
  ["Healing takes time, and asking for help is a courageous step.", "Mariska Hargitay"],
  ["You don't have to see the whole staircase, just take the first step.", "Martin Luther King Jr."],
  ["Every storm runs out of rain.", "Maya Angelou"],
  ["What we plant in the soil of contemplation, we shall reap in the harvest of action.", "Meister Eckhart"],
  ["You are stronger than you think.", "Recovery community saying"],
  ["Be patient with yourself. Self-growth is tender; it's holy ground.", "Stephen Covey"],
  ["The only way out is through.", "Robert Frost"],
  ["Hope is the thing with feathers.", "Emily Dickinson"],
  ["It does not matter how slowly you go as long as you do not stop.", "Confucius"],
  ["Just keep going. Everybody gets better if they keep at it.", "Ted Lasso (Apple TV)"],
  ["A smooth sea never made a skilled sailor.", "Franklin D. Roosevelt"],
  ["Not all storms come to disrupt your life, some come to clear your path.", "Recovery community saying"],
  ["Recovery is not a race. You don't have to feel guilty if it takes you longer than you thought it would.", "Recovery community saying"],
  ["Nothing changes if nothing changes.", "Recovery community saying"],
  ["Keep your face always toward the sunshine, and shadows will fall behind you.", "Walt Whitman"],
  ["Difficult roads often lead to beautiful destinations.", "Zig Ziglar"],
  ["You are allowed to be both a masterpiece and a work in progress.", "Sophia Bush"],
  ["The strongest people are not those who show strength in front of us, but those who win battles we know nothing about.", "Recovery community saying"],
  ["With the new day comes new strength and new thoughts.", "Eleanor Roosevelt"],
  ["Sobriety doesn't mean the end. It means the beginning of a new life.", "Recovery community saying"],
  ["I am not what happened to me, I am what I choose to become.", "Carl Jung"],
  ["The struggle you're in today is developing the strength you need for tomorrow.", "Robert Tew"],
  ["Sometimes the smallest step in the right direction ends up being the biggest step of your life.", "Naeem Callaway"],
  ["It always seems impossible until it's done.", "Nelson Mandela"],
  ["You have power over your mind, not outside events.", "Marcus Aurelius"],
  ["Growth is painful. Change is painful. But nothing is as painful as staying stuck somewhere you don't belong.", "Mandy Hale"],
  ["The wound is the place where the light enters you.", "Rumi"],
  ["Trust the timing of your life.", "Recovery community saying"],
  ["Every day is a second chance.", "Recovery community saying"],
  ["Be gentle with yourself, you're doing the best you can.", "Recovery community saying"],
  ["Surrender to win.", "Alcoholics Anonymous saying"],
  ["Let go or be dragged.", "Zen proverb"],
  ["You can't go back and change the beginning, but you can start where you are and change the ending.", "C.S. Lewis"],
  ["The comeback is always stronger than the setback.", "Recovery community saying"],
  ["What you survived was not weakness, it was the proof you can endure.", "Recovery community saying"],
  ["Action is the foundational key to all success.", "Pablo Picasso"],
  ["The best way out is always through.", "Robert Frost"],
  ["You are someone's reason to keep going.", "Recovery community saying"]
];

var RESOURCE_CATEGORIES = [
  { key: "crisis", label: "Crisis Support", desc: "988 Suicide & Crisis Lifeline, Crisis Text Line", url: function(z) { return "https://988lifeline.org"; }, always: true },
  { key: "aa_inperson", label: "AA Meetings \u2014 In Person", desc: "Find nearby Alcoholics Anonymous meetings on the map", url: function(z) { return "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent("AA meetings near " + z); } },
  { key: "mh", label: "Mental Health Providers", desc: "Find counselors & mental health treatment", url: function(z) { return "https://findtreatment.gov/locator?sAddr=" + z; } },
  { key: "sud", label: "Addiction / Substance Use Treatment", desc: "Rehab, detox, MAT providers", url: function(z) { return "https://findtreatment.gov/locator?sAddr=" + z; } },
  { key: "iop", label: "IOP / PHP / Outpatient Services", desc: "Intensive outpatient & outpatient programs \u2014 use filters on the site to narrow to outpatient", url: function(z) { return "https://findtreatment.gov/locator?sAddr=" + z; } },
  { key: "sober", label: "Sober Living", desc: "Oxford House recovery residences \u2014 search by zip once there", url: function(z) { return "https://www.oxfordvacancies.com/"; }, always: true },
  { key: "medicaid", label: "Medicaid & Insurance", desc: "Apply or check coverage by state", url: function(z) { return "https://www.medicaid.gov/state-overviews/index.html"; }, always: true },
  { key: "homeless", label: "Homelessness / Shelters", desc: "HUD's shelter, health, and clothing locator \u2014 enter your location once there", url: function(z) { return "https://www.hud.gov/findshelter"; }, always: true },
  { key: "211", label: "211 Community Help Line", desc: "Finds your local 211 office (211 is region-by-region, not one national site)", url: function(z) { return "https://www.211.org/about-us/your-local-211"; }, always: true },
  { key: "food", label: "Food Pantries / Soup Kitchens", desc: "Find a food bank \u2014 enter your zip once there", url: function(z) { return "https://www.feedingamerica.org/find-your-local-foodbank"; }, always: true },
  { key: "transport", label: "Transportation Assistance", desc: "Local rides, bus passes, gas help \u2014 via your local 211", url: function(z) { return "https://www.211.org/about-us/your-local-211"; }, always: true },
  { key: "clothing", label: "Clothing Assistance", desc: "Free or low-cost clothing \u2014 via your local 211", url: function(z) { return "https://www.211.org/about-us/your-local-211"; }, always: true },
  { key: "jobs", label: "Jobs (Temp & Long-Term)", desc: "Local job openings", url: function(z) { return "https://www.careeronestop.org/JobSearch/job-search.aspx?location=" + z; } },
  { key: "training", label: "Job Training & Centers", desc: "American Job Centers near you", url: function(z) { return "https://www.careeronestop.org/LocalHelp/AmericanJobCenters/find-american-job-centers.aspx?location=" + z; } },
  { key: "education", label: "Education / GED", desc: "Adult education & GED programs", url: function(z) { return "https://www.careeronestop.org/LocalHelp/EducationTraining/find-ged-classes.aspx?location=" + z; } },
  { key: "health", label: "Health Providers / Clinics", desc: "Low-cost & community health centers", url: function(z) { return "https://findahealthcenter.hrsa.gov/?zip=" + z + "&radius=25&incrementalsearch=true"; } }
];
