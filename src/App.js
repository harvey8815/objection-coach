import { useState, useRef, useCallback, useEffect } from "react";

function matchesObjection(text, obj) {
  const t = text.toLowerCase();
  for (const trigger of obj.triggers) {
    if (t.includes(trigger.toLowerCase())) return true;
  }
  if (obj.keywords) {
    for (const group of obj.keywords) {
      if (group.every(kw => t.includes(kw.toLowerCase()))) return true;
    }
  }
  return false;
}

const PRODUCTS = {
  essentials: {
    id: "essentials", name: "Essentials Package",
    subtitle: "Geo-Site · SEO · Google Business · Directories",
    price: "$393–$497/mo", color: "#6366f1", icon: "🌐",
    objections: [
      { id: 101, category: "Dismissive", triggers: ["not interested","no interest","don't need","not for me","no thanks","we're good","i'm good","doesn't interest"], keywords: [["not","interested"],["don't","need","this"]], rebuttal: "Totally fair — most of our clients said the same thing before they saw the results. Quick question: is it that you've already got your marketing dialed in, or you just get slammed with calls like this all day?", rebuttal2: "I hear you. If I could show you that contractors in your area are getting 5–10 extra calls a month from Google just by fixing their listing — would that be worth 60 seconds?", tip: "Stay calm, slow your pace. Smile — they'll hear it.", tipIcon: "😌" },
      { id: 102, category: "Dismissive", triggers: ["too busy","bad time","busy right now","can't talk","not a good time","don't have time","no time","call back later","call me back"], keywords: [["busy","right"],["don't","have","time"],["no","time","right"]], rebuttal: "No worries — I'll be super quick. One sentence: I help contractors show up at the top of Google when someone searches for your service in your city. Worth 60 seconds later today?", rebuttal2: "I get it. When's a better time — morning or afternoon tomorrow? I'll put it in my calendar right now.", tip: "Acknowledge fast and pivot immediately. Don't linger on the apology.", tipIcon: "⚡" },
      { id: 103, category: "Dismissive", triggers: ["send me an email","email me","send me something","shoot me an email","send info","send me details"], keywords: [["send","email"],["shoot","email"]], rebuttal: "Absolutely — what's your biggest challenge right now? Getting more calls, showing up on Google, or converting the calls you already get? I want to send you something actually relevant.", rebuttal2: "Happy to. But quick question first — are you currently showing up in the top 3 on Google Maps when someone searches for your service in your city?", tip: "Don't just say yes. Qualify first so the email actually gets opened.", tipIcon: "📧" },
      { id: 104, category: "Dismissive", triggers: ["is this a cold call","are you selling","what is this","who is this","why are you calling","what are you calling about"], keywords: [["selling","something"],["cold","call"],["what","calling"]], rebuttal: "Ha — yeah, I won't lie. But it's a short one. I ran a quick audit on your Google Business Profile before calling and noticed a few things that are costing you leads. Can I share what I found in 30 seconds?", rebuttal2: "You caught me. But I only call businesses I think I can genuinely help — and yours came up for a specific reason. Give me 30 seconds?", tip: "Lead with the audit insight. Specificity beats a generic pitch every time.", tipIcon: "😄" },
      { id: 105, category: "Dismissive", triggers: ["get these calls","calls like this","calls every day","all day long","thousand calls","keep getting calls","calls all the time","get calls like","calls all day","getting these calls","get a lot of calls"], keywords: [["get","calls","every"],["calls","all","day"],["calls","all","time"],["get","calls","like"]], rebuttal: "Ha! You and every business owner I call. So I'll skip the pitch — let me ask one thing: when someone in your city Googles your service right now, are you showing up? Because if not, your competitors are getting those calls instead.", rebuttal2: "Fair. Then let me make this quick — I pulled up your Google listing before calling. Can I tell you the one thing I found that's costing you leads, and you tell me if it's worth a conversation?", tip: "Match their energy with humor, then hit them with a specific insight.", tipIcon: "😂" },
      { id: 106, category: "Dismissive", triggers: ["don't do online","don't use internet","not online","don't need internet","word of mouth","referrals only","all referrals"], keywords: [["word","of","mouth"],["referrals","only"],["don't","need","online"]], rebuttal: "That's awesome — referrals are the best leads. But here's a question: when those referrals look you up online before calling, what do they find? Because 87% of people check Google even after getting a referral.", rebuttal2: "Word of mouth is gold. But what happens when a referral Googles you and finds no reviews, an incomplete profile, or a competitor showing up instead? We make sure you look as good online as you do in person.", tip: "Validate referrals, then expose the gap. Everyone Googles before they call.", tipIcon: "🤝" },
      { id: 107, category: "Dismissive", triggers: ["don't need a website","have a website already","website is fine","my website is good","just got a website"], keywords: [["don't","need","website"],["have","website"],["website","fine"]], rebuttal: "Good — a website is the foundation. But here's the thing: 80% of local contractor calls come from Google Maps, not websites. Are you showing up in the top 3 on the map when someone searches your service in your city?", rebuttal2: "Great — how many leads is your website generating per month right now? Because most contractor websites we audit are invisible on Google even though they look great. Can I show you what yours looks like from Google's perspective?", tip: "Redirect from website to Google Maps. That's where the real calls come from.", tipIcon: "🌐" },
      { id: 108, category: "Budget", triggers: ["too expensive","costs too much","too much money","that's a lot","way too much","can't justify","out of my budget","more than i expected","that's too much","too pricey"], keywords: [["too","expensive"],["too","much","money"],["cost","too","much"],["price","high"],["too","pricey"]], rebuttal: "Fair point on price. Our entry package is $393/month. If that generates even 2 extra jobs — what's your average job ticket? Because most contractors pay it back in the first week.", rebuttal2: "I hear you. Let me ask — what are you currently spending on marketing? Because most contractors we work with were spending more on Facebook ads and getting less than what a $393 Google presence delivers.", tip: "Anchor to job ticket value immediately. Make the ROI math feel obvious.", tipIcon: "📊" },
      { id: 109, category: "Budget", triggers: ["no budget","don't have budget","no money","can't afford","not in the budget","tight budget","money is tight","slow right now","business is slow"], keywords: [["no","budget"],["can't","afford"],["money","tight"],["business","slow"]], rebuttal: "Completely understand. Can I ask — is business slow because of the season, or because the phone just isn't ringing like it used to? Because one of those is a symptom of the exact problem we solve.", rebuttal2: "That's fair. Actually, the slower things are, the more important it is to show up on Google — that's when competitors are actively stealing the calls you're missing. Would it be worth a quick look at what's possible?", tip: "Flip slow business into urgency. Slow seasons are when SEO matters most.", tipIcon: "💰" },
      { id: 110, category: "Budget", triggers: ["how much","what does it cost","what's the price","how much is it","what do you charge","pricing","what's the investment","what are your rates"], keywords: [["how","much"],["what","cost"],["what","price"],["what","charge"]], rebuttal: "Our packages start at $393/month for 3 service pages and your Google Business Profile, up to $497 for 5 service pages across 3 locations. But before price matters — what's your average job ticket? I want to make sure the ROI makes sense for your business first.", rebuttal2: "I'll share it — but I always want to give context first so the number lands right. What's the one thing you need most: more calls, better rankings, or stronger online reviews?", tip: "Never lead with price. Anchor value, then share the number.", tipIcon: "🏷️" },
      { id: 111, category: "Budget", triggers: ["cutting costs","reducing spend","watching my money","tight on cash","trying to save","cutting back"], keywords: [["cutting","costs"],["reducing","spend"],["tight","cash"]], rebuttal: "Makes sense. Here's the thing — organic SEO is actually the cheapest long-term lead source. Unlike ads that stop the moment you stop paying, a Google ranking keeps generating calls for free. It's cost reduction, not cost addition.", rebuttal2: "I get it. What are you currently spending that isn't working? Because we might be able to help you cut something that isn't delivering and replace it with something that is.", tip: "Position SEO as the alternative to expensive paid ads. It's a cost cut, not an add.", tipIcon: "✂️" },
      { id: 112, category: "Existing Solution", triggers: ["already have someone","already working with","have an agency","have a marketing company","someone does that","have someone for that","have a guy","have a person"], keywords: [["already","marketing"],["already","agency"],["already","someone","doing"]], rebuttal: "Good to hear — what are they doing for you? I ask because most contractors working with a general agency don't realize there's a massive difference between general digital marketing and local Google Maps optimization specifically for service businesses.", rebuttal2: "Makes sense. Quick question — are you currently in the top 3 on Google Maps when someone searches your service in your city? Because that's the benchmark I'd use to evaluate how well anyone is doing for you.", tip: "Ask the top-3 Google Maps question. It immediately exposes gaps.", tipIcon: "🔍" },
      { id: 113, category: "Existing Solution", triggers: ["already do seo","already doing seo","have seo","doing our own seo","already ranked","already on google","already at the top","rank number one"], keywords: [["already","seo"],["have","seo"],["already","ranked"]], rebuttal: "That's awesome. Are you in the top 3 on Google Maps — not just organic search, but the actual map pack? Because that's where 80% of contractor calls come from, and it's a completely different skill set than regular SEO.", rebuttal2: "Great — what keywords are you ranking for? I ask because a lot of contractors rank for their business name but not the actual search terms customers use. Would you be open to a quick audit to see if there are gaps?", tip: "Distinguish map pack from organic. Most contractors don't realize there's a difference.", tipIcon: "🗺️" },
      { id: 114, category: "Existing Solution", triggers: ["tried before","didn't work","tried seo","tried marketing","doesn't work","waste of money","wasted money","got burned","bad experience","no results","didn't get results"], keywords: [["wasted","money","marketing"],["didn't","get","results"],["tried","didn't","work"]], rebuttal: "I hear that a lot and I get it — a lot of agencies take your money and show you rankings for keywords nobody searches. Can I ask what you tried specifically? Because local Google Maps optimization for contractors is very different from what most agencies do.", rebuttal2: "That's the most common thing I hear. What happened — did you not see results, or did the agency just disappear after you signed? Because both tell me very different things about what went wrong.", tip: "Validate the bad experience fully. Then position your specific specialty as different.", tipIcon: "🛠️" },
      { id: 115, category: "Existing Solution", triggers: ["do it in house","handle it ourselves","do our own marketing","my nephew","my cousin","family member does it","someone on my team"], keywords: [["in","house"],["do","ourselves"],["nephew","does"],["cousin","does"]], rebuttal: "That's great — do you know if they're specifically focused on the Google Maps local pack? Because that's a very specific skill set, and most in-house folks are better at social media or general websites than local map optimization.", rebuttal2: "Smart — keeping it in-house saves money. How are the results? Are you getting consistent calls from Google, or is it more unpredictable month to month?", tip: "Respect the in-house team. Ask about map pack specifically — that's almost always the gap.", tipIcon: "🏠" },
      { id: 116, category: "Existing Solution", triggers: ["have a facebook page","use facebook","use social media","do social media","instagram","tiktok","social media instead"], keywords: [["facebook","page"],["use","facebook"],["social","media","instead"]], rebuttal: "Social media is great for brand awareness. But here's the difference: when someone needs a plumber right now, they don't go to Facebook — they Google it. We make sure you're the one they find. Can I show you what that looks like?", rebuttal2: "Social media and Google are very different. Social is where people discover you. Google is where people find you when they're ready to buy. We handle the Google side — the one that generates immediate calls. Would it be worth 2 minutes to see what yours looks like?", tip: "Never bash social media. Explain the difference in buyer intent.", tipIcon: "📱" },
      { id: 117, category: "Existing Solution", triggers: ["run ads","doing ads","using google ads","pay per click","facebook ads","running paid ads","spending on ads"], keywords: [["run","ads"],["doing","ads"],["google","ads"],["pay","per","click"],["paid","ads"]], rebuttal: "Ads are great for fast results. The problem is they stop the moment you stop paying — and the average contractor spends $1,500–$3,000 a month on ads. What we build keeps generating calls for free, for years. They work great together. Can I show you what the combo looks like?", rebuttal2: "Smart. What's your cost per lead from ads right now? Because most contractors we work with are paying $80–$200 per lead from ads, and we get it down to $20–$40 through organic. Would it be worth comparing?", tip: "Position SEO as the long-term play that reduces ad dependency.", tipIcon: "💡" },
      { id: 118, category: "Timing", triggers: ["call me back","try me later","follow up later","not now","maybe later","another time","not ready","not the right time","bad timing","try me in"], keywords: [["call","back"],["not","right","time"],["not","ready"],["try","later"]], rebuttal: "Happy to. Out of curiosity — what's likely to change? Is there a seasonal slowdown coming up, or are you waiting on a specific budget to open?", rebuttal2: "Of course. When I follow up — what would be the ideal timing? Spring, end of month? I want to reach you when it actually makes sense, not just call back randomly.", tip: "Qualify every callback. Get a specific reason and date.", tipIcon: "📅" },
      { id: 119, category: "Timing", triggers: ["just signed","locked in","locked in a contract","signed a contract","under contract","committed to someone","just started with"], keywords: [["just","signed"],["locked","in"],["under","contract"],["committed","to"]], rebuttal: "Totally respect that — you gave your word and you should honor it. When does that contract end? I'd love to be the first call you make when it does, so you have a real comparison ready.", rebuttal2: "Makes sense. Can I ask — what are they doing specifically for you? Because when your contract ends, you'll want to know exactly what to look for. Happy to give you a checklist so you can evaluate it properly.", tip: "Respect the commitment. Plant the seed for when it ends.", tipIcon: "📋" },
      { id: 120, category: "Timing", triggers: ["just redid","just updated","just launched","new website","just got a website","just built","just redesigned"], keywords: [["just","website"],["just","built"],["just","redesigned"],["new","site"]], rebuttal: "Perfect timing — a new site is a blank slate for SEO. The problem is most web designers build beautiful sites that Google can't find. Let me run a quick audit — if it's already optimized, I'll tell you and hang up. Fair?", rebuttal2: "Nice! Who built it? I ask because 90% of new contractor sites we audit are invisible on Google even though they look great. It takes 2 minutes to check — want me to tell you right now where yours stands?", tip: "Validate the new site. Then immediately offer a free audit as the next step.", tipIcon: "🚀" },
      { id: 121, category: "Timing", triggers: ["busy season","peak season","really busy","slammed right now","too much work","more than enough work"], keywords: [["busy","season"],["too","much","work"],["slammed","right"]], rebuttal: "Good problem to have! Quick question — what happens when busy season ends? Because the contractors who dominate slow season are the ones who built their Google presence during the busy season. Takes 90–120 days to kick in.", rebuttal2: "Awesome. The best time to plant a tree was 20 years ago — the second best time is now. SEO takes 90 days to show results. If we start today, you'll be ranked right when things slow down. Can I show you what that looks like?", tip: "Reframe busy season as the perfect time to start. SEO has a 90-day lag.", tipIcon: "🔥" },
      { id: 122, category: "Skepticism", triggers: ["seo doesn't work","seo is dead","google is changing","ai is replacing google","chatgpt replacing google","nobody uses google anymore","people use tiktok"], keywords: [["seo","doesn't","work"],["seo","dead"],["ai","replacing","google"],["nobody","uses","google"]], rebuttal: "I hear that a lot. Here's the data: 46% of ALL Google searches have local intent, and the local map pack gets 70% of the clicks. Google isn't going anywhere — if anything, AI is making local results MORE prominent. Are you seeing your competitors show up there?", rebuttal2: "Fair question. Did you know that 97% of people search online to find local businesses, and Google still handles 92% of all search traffic? The channel isn't dead — most businesses just aren't optimizing it properly. Would you like to see what that looks like for your trade in your city?", tip: "Lead with data. Skepticism about SEO usually comes from past bad experiences, not reality.", tipIcon: "📊" },
      { id: 123, category: "Skepticism", triggers: ["takes too long","seo takes forever","won't see results for months","too slow","want results now","need results fast","want immediate results"], keywords: [["takes","too","long"],["results","months"],["too","slow"],["results","now"]], rebuttal: "You're right that SEO takes 60–90 days to kick in. But here's what most people miss — your Google Business Profile can start driving calls in the first week. That's the fast-win piece we start with. Want to see what that looks like?", rebuttal2: "Fair. That's why we always start with your Google Business Profile and citations — those can show results in 2–4 weeks. The geo-targeted website is the long-term play. Can I show you both timelines side by side?", tip: "Separate GBP quick wins from the longer SEO timeline. Show them the fast path first.", tipIcon: "⏱️" },
      { id: 124, category: "Skepticism", triggers: ["i don't need more leads","already have enough work","too much work","fully booked","can't take more jobs","at capacity"], keywords: [["enough","work"],["fully","booked"],["too","much","work"],["at","capacity"]], rebuttal: "That's great — seriously, congratulations. Quick question though: do you have a waitlist system or a way to charge premium rates because demand is high? Because contractors with strong Google presence typically charge 15–20% more. Worth thinking about for the future?", rebuttal2: "Love to hear it. Here's the thing — what happens when this season ends? The contractors who stay booked year-round are the ones with a consistent Google presence. We're just planting seeds for the future. Does that make sense?", tip: "Validate fully. Then shift to premium pricing and off-season planning.", tipIcon: "🎯" },
      { id: 125, category: "Skepticism", triggers: ["my customers don't use google","my clients are old","my clients are referrals","don't need online","my market is different","different type of client"], keywords: [["customers","don't","use","google"],["clients","are","old"],["market","is","different"]], rebuttal: "I'd actually challenge that — 85% of people over 65 use smartphones, and 74% of them search Google for local services. And even if a client comes via referral, 87% of people still Google the business before they call. What do they find when they search yours?", rebuttal2: "Even referral-only businesses — their clients Google them before calling to check reviews, hours, and legitimacy. If what they find doesn't look professional, they call someone else. Can I show you what a search for your business looks like right now?", tip: "Challenge the assumption with data. Everyone Googles before they call.", tipIcon: "🤔" },
      { id: 126, category: "Decision", triggers: ["talk to my partner","check with my partner","ask my wife","ask my husband","run it by","business partner","need to ask"], keywords: [["talk","partner"],["check","partner"],["run","by"]], rebuttal: "Of course — big decisions should be made together. What's your partner's biggest concern usually when it comes to marketing spend? I want to make sure I address it when we speak.", rebuttal2: "Totally respect that. When would be a good time to connect with both of you? I can do a 20-minute call and walk through exactly what we'd do for your business specifically.", tip: "Don't fight it. Get the three-way call on the calendar.", tipIcon: "👥" },
      { id: 127, category: "Decision", triggers: ["not the decision maker","not my decision","someone else","boss handles","owner decides","not up to me","not my call","manager decides"], keywords: [["not","my","decision"],["someone","else","decides"],["owner","decides"]], rebuttal: "No problem — who's the right person to talk to about your company's online presence and lead generation? I want to make sure I'm talking to the right person.", rebuttal2: "Appreciate you being upfront. Can you point me in the right direction — is it the owner, the manager, or someone on the marketing side?", tip: "Always ask for a name. Never hang up without knowing who to call next.", tipIcon: "➡️" },
      { id: 128, category: "Stalling", triggers: ["let me think","need to think","think about it","think it over","not sure","need to consider","give me time","sleep on it"], keywords: [["think","about","it"],["need","think"],["sleep","on","it"]], rebuttal: "Totally fair. What's the main thing you need to think through — is it whether this will actually work for your type of business, the investment, or something else? I'd rather address it now.", rebuttal2: "Of course. What would make this a clear yes for you? Because I'd rather answer that question now than have you wonder about it.", tip: "Never accept 'think about it' without knowing what the hesitation is.", tipIcon: "💭" },
      { id: 129, category: "Stalling", triggers: ["how do i know it works","prove it works","show me results","do you have proof","any results","case studies","show me examples"], keywords: [["how","know","works"],["prove","it","works"],["show","results"],["case","studies"]], rebuttal: "Fair — I'd want proof too. Can I show you a contractor in your trade in a similar market — their before-and-after Google rankings and the call volume change? Takes about 3 minutes.", rebuttal2: "Absolutely. We track everything — rankings, call volume, Google Business Profile views, direction requests. Can I walk you through a real example from someone in your exact trade?", tip: "Offer specifics immediately. Generic claims lose — real examples win.", tipIcon: "📈" },
      { id: 130, category: "Positive", triggers: ["maybe","could be interested","tell me more","sounds interesting","i'm listening","go ahead","want to know more","interested","what does it include"], keywords: [["tell","more"],["sounds","interesting"],["could","interested"],["what","include"]], rebuttal: "Great — let me lock in a quick screen share. Morning or afternoon works better? I'll pull up your current Google presence and show you exactly what we'd do. Takes 20 minutes.", rebuttal2: "Love it. I'll send a calendar link right now. 20 minutes — I'll show you your current Google listing, what your competitors look like, and exactly what we'd change. Sound good?", tip: "CLOSE NOW. Don't keep pitching — book the screen share immediately.", tipIcon: "🏆" }
    ]
  },
  ai_system: {
    id: "ai_system", name: "AI Lead Conversion System",
    subtitle: "Missed Call Text-Back · AI Booking · CRM · Reviews",
    price: "$997/mo", color: "#f59e0b", icon: "🤖",
    objections: [
      { id: 201, category: "Dismissive", triggers: ["not interested","no interest","don't need","not for me","no thanks","we're good","i'm good"], keywords: [["not","interested"],["don't","need","this"]], rebuttal: "Totally understand. Quick question before I let you go — what happens right now when a potential customer calls you and you don't pick up? Because 78% of customers go to the next business on Google if they don't get an answer in the first 5 minutes.", rebuttal2: "Fair enough. If I told you there's a way to automatically text back every missed call within 7 seconds and book them on your calendar — while you're out on a job — would that even be worth a 2-minute look?", tip: "Lead with the missed call pain. Make the cost of inaction tangible.", tipIcon: "😌" },
      { id: 202, category: "Dismissive", triggers: ["too busy","bad time","can't talk","busy right now","not a good time","don't have time","call back later"], keywords: [["busy","right"],["don't","have","time"]], rebuttal: "That's actually exactly why I'm calling — you're busy working, and while you're working, leads are calling and not getting answered. That's the exact problem we solve. Can I get 60 seconds to show you how?", rebuttal2: "I hear you. When's a better time? I want to show you something that actually saves you time — not something that adds to your plate.", tip: "Reframe busy as the reason they need this. It's a pain point, not an objection.", tipIcon: "⚡" },
      { id: 203, category: "Dismissive", triggers: ["send me an email","email me","send me something","shoot me an email","send info"], keywords: [["send","email"]], rebuttal: "Happy to. So I send you the right info — what's your biggest lead problem right now: missing calls after hours, slow follow-up, or leads going cold before you get back to them?", rebuttal2: "Will do. But this is really something you need to see live — it takes 90 seconds to demo. Can I just walk you through how the missed call text-back works before I send anything?", tip: "Qualify before sending. Find the specific pain so the email is relevant.", tipIcon: "📧" },
      { id: 2035, category: "Dismissive", triggers: ["get these calls","calls like this","calls every day","calls all the time","get calls like this","i get these calls","get a lot of calls","calls all day","getting these calls","calls like this all","keep getting calls","thousand calls","hundred calls","all day long"], keywords: [["get","calls","every"],["calls","all","day"],["calls","all","time"],["get","calls","like"],["i","get","these","calls"]], rebuttal: "Ha! You and every business owner I talk to — so I'll skip the pitch. One question: how many calls do you miss in a typical week when you're out on a job? Because every one of those is revenue walking out the door.", rebuttal2: "Fair. Let me make this different — one question, and if your answer is 'we never miss a call,' I'll hang up myself. What happens when a lead calls at 7pm on a Saturday?", tip: "Skip the pitch. Ask the missed call question. It hits every contractor.", tipIcon: "😂" },
      { id: 204, category: "AI Skepticism", triggers: ["don't need ai","don't want ai","not into ai","ai doesn't work","hate ai","not interested in ai","ai is hype","ai won't work for me"], keywords: [["don't","need","ai"],["ai","doesn't","work"],["hate","ai"]], rebuttal: "Totally fair — and honestly, I wouldn't call it AI either. It's really just automated texting. When you miss a call, the system texts the customer back in 7 seconds from your business number. They just think you responded fast. No robots, no sci-fi stuff.", rebuttal2: "I get the skepticism — a lot of AI tools are overhyped. This one does one thing: makes sure no lead falls through the cracks when you're busy. Would it help if I showed you exactly what the customer experience looks like in a 2-minute demo?", tip: "Reframe AI as automation. 'Automated text-back' lands better than 'AI'.", tipIcon: "🤖" },
      { id: 205, category: "AI Skepticism", triggers: ["is this a bot","talking to a bot","is this automated","robo call","robocall","are you a robot","is this real"], keywords: [["is","this","bot"],["talking","bot"],["automated","call"]], rebuttal: "Nope — I'm a real person. But ironically, the system I want to tell you about does use automation to follow up with YOUR missed callers. And here's the key — they get a real, personalized text from your actual business number, not from some robot service.", rebuttal2: "Real person here! But the irony is — the tool I'm calling about means your customers never have to talk to a bot either. They just get a fast text back from you, automatically. Pretty different from what you're imagining.", tip: "Be human and transparent. Then pivot to how it benefits their customers.", tipIcon: "👤" },
      { id: 206, category: "AI Skepticism", triggers: ["customers don't want ai","customers don't like bots","people don't like automated","customers want a real person","don't want to talk to a bot","my clients are old fashioned"], keywords: [["customers","don't","like"],["customers","want","real"],["clients","old","fashioned"]], rebuttal: "That's a real concern — and I agree with you. That's exactly why our system sends a text FROM your business number, within 7 seconds of a missed call. To the customer, it just looks like you responded immediately. They never know it was automated.", rebuttal2: "I totally understand that. Here's what's interesting — we see 65–70% response rates on those automated texts. Customers respond because it feels personal. And it IS personal — it uses their name and your business name. Want to see what one looks like?", tip: "Emphasize it feels personal because it is. Show a real example of the text.", tipIcon: "💬" },
      { id: 207, category: "AI Skepticism", triggers: ["we already follow up","we call people back","we already do that","we follow up manually","i call back","i follow up","we have a process"], keywords: [["already","follow","up"],["call","back","already"],["have","process"]], rebuttal: "That's great — how fast does that typically happen? Because research shows leads contacted within 5 minutes are 9x more likely to convert than those reached after 30 minutes. We're talking seconds, not minutes.", rebuttal2: "Awesome. What happens when you're on a job at 6pm and a lead calls? Or on a Saturday morning? Because those after-hours calls are almost always the ones that go to a competitor who responds first.", tip: "Focus on speed and after-hours gaps. That's where every manual process breaks down.", tipIcon: "⏱️" },
      { id: 208, category: "AI Skepticism", triggers: ["what if they don't want texts","what if they prefer calls","some people don't text","my customers are too old to text","what about people who don't text"], keywords: [["don't","want","texts"],["prefer","calls"],["don't","text"],["too","old","text"]], rebuttal: "Fair concern. Two things: first, 97% of texts are read within 3 minutes — it's actually the fastest way to reach most people. Second, the text we send still asks them to call you back if they prefer. It just bridges the gap so they don't go cold.", rebuttal2: "Great question. The system doesn't replace calls — it bridges the gap. When they miss you, they get a text. The text tells them you'll call them back and asks if they want to book a time. Most people text back; some call. Either way, you don't lose them.", tip: "Clarify that texts lead to calls. It's a bridge, not a replacement.", tipIcon: "📱" },
      { id: 209, category: "Existing Solution", triggers: ["already have a crm","have a crm","use a crm","use jobber","use housecall","use servicetitan","use hubspot","use go high level","have software"], keywords: [["already","crm"],["have","crm"],["use","crm"],["have","software"]], rebuttal: "That's great — which one? I ask because we integrate with most CRMs. We're not replacing it — we're adding the automated follow-up layer that most CRMs don't do natively. Your existing workflows stay exactly the same.", rebuttal2: "Perfect — then you already get the value of tracking leads. What we add is the piece that most CRMs leave out: the moment a lead calls and you miss it, they get an automatic text back in 7 seconds and get booked without you touching anything.", tip: "Never compete with their CRM. Position as the automation layer on top.", tipIcon: "🔗" },
      { id: 210, category: "Existing Solution", triggers: ["have an answering service","use an answering service","have a receptionist","have someone who answers","someone answers my calls","virtual receptionist"], keywords: [["answering","service"],["have","receptionist"],["virtual","receptionist"]], rebuttal: "Smart — that's a great setup. What hours does your answering service cover? Because most services stop at 5pm, and 40% of contractor calls come in after hours, on weekends, and on holidays. That's the gap we fill.", rebuttal2: "Great. And what happens when someone calls at 7pm on a Saturday — do they get a text back within 7 seconds? Because that's the window where most leads decide to call someone else. We cover that gap automatically.", tip: "Find the after-hours gap. It almost always exists, even with an answering service.", tipIcon: "📞" },
      { id: 211, category: "Existing Solution", triggers: ["already have automation","have automation set up","already automated","have sequences","have follow up","have email follow up"], keywords: [["already","automation"],["have","automation"],["already","automated"]], rebuttal: "Awesome — what does your current automation look like when someone calls and you miss it? Because the first 5 minutes are critical. A missed call text-back in 7 seconds is very different from an email follow-up an hour later.", rebuttal2: "Great. What's your current response time on missed calls specifically — not emails or forms, but actual phone calls that go unanswered? Because that's usually the gap even well-automated businesses have.", tip: "Focus specifically on missed call response time. That's the gap even automated businesses have.", tipIcon: "⚙️" },
      { id: 212, category: "Existing Solution", triggers: ["tried before","didn't work","tried similar","tried an automation tool","had something like this","tried go high level","tried hubspot"], keywords: [["tried","before"],["didn't","work"],["tried","similar"],["tried","automation"]], rebuttal: "I hear that — what happened? Because there's a big difference between a general automation platform you have to set up yourself and a done-for-you system we configure specifically for your business. What fell apart last time?", rebuttal2: "That's the most common thing I hear. Was it that the tool itself didn't work, or was it that nobody set it up properly and it never actually ran? Because we handle the full setup — you don't touch anything.", tip: "Find out what actually failed. Setup failures vs. tool failures are very different.", tipIcon: "🛠️" },
      { id: 213, category: "Budget", triggers: ["too expensive","costs too much","too much money","that's a lot","way too much","997","thousand dollars","a thousand a month","too much per month"], keywords: [["too","expensive"],["too","much","money"],["thousand","month"],["997"]], rebuttal: "Fair question on price. At $997/month — what's your average job ticket? Because if the system recovers just one missed job per month that you would have lost, most contractors are already profitable by week one.", rebuttal2: "Let me flip it — what's it costing you right now to miss leads? If you're missing 5 calls a week and converting even 20% of those, that's potentially multiple thousands per month walking out the door. The $997 pays for itself in one job.", tip: "Make them calculate the cost of inaction. Lost leads are invisible losses.", tipIcon: "💰" },
      { id: 214, category: "Budget", triggers: ["no budget","don't have budget","can't afford","not in the budget","money is tight","slow right now","cutting costs","business is slow"], keywords: [["no","budget"],["can't","afford"],["money","tight"],["business","slow"]], rebuttal: "Totally understand. Can I ask — is business slow because there's not enough work in your area, or because leads are calling and not being captured? Because one of those is a market problem, and one is a system problem we can fix.", rebuttal2: "Makes sense. What if I showed you that the system typically recovers enough missed revenue in the first month to cover its own cost? Would it be worth a 15-minute call to see if the math works for your business specifically?", tip: "Separate 'no market' from 'losing leads.' One is fixable, one isn't.", tipIcon: "📊" },
      { id: 215, category: "Budget", triggers: ["how much","what does it cost","what's the price","how much is it","what do you charge","pricing","what's the investment"], keywords: [["how","much"],["what","cost"],["what","price"],["what","charge"]], rebuttal: "It's $997/month — and before that number scares you, let me give you context. What's your average job ticket? Because most contractors recover that in a single missed lead the system catches. Want to do the math together?", rebuttal2: "One flat rate: $997/month. No setup fees, no contracts. We configure everything: missed call text-back, follow-up sequences, review automation, and a revenue dashboard. How many calls do you miss in a typical week?", tip: "Never just drop the price. Anchor it to their job ticket and missed leads.", tipIcon: "🏷️" },
      { id: 216, category: "Budget", triggers: ["that's expensive for software","just software","paying for software","software shouldn't cost that","seems like a lot for an app"], keywords: [["just","software"],["paying","software"],["lot","app"],["expensive","software"]], rebuttal: "I get that. But this isn't really software you're paying for — it's a revenue recovery system. Most software sits on a shelf. This one is actively texting your missed callers, booking jobs on your calendar, and sending review requests. It's working 24/7 so you don't have to.", rebuttal2: "Fair point. Think of it less like software and more like a 24/7 employee who never sleeps, never misses a call, and costs a fraction of what a receptionist would. At $997/month versus $3,000+ for a part-time receptionist — the math works.", tip: "Reframe from software to a 24/7 employee. It's a staffing solution, not a tech purchase.", tipIcon: "💡" },
      { id: 217, category: "Decision", triggers: ["talk to my partner","check with my partner","run it by","ask my wife","ask my husband","need approval","business partner"], keywords: [["talk","partner"],["check","partner"],["run","by"]], rebuttal: "Totally — this is a real investment and should be a joint decision. What's your partner's biggest concern usually around software or automation? I want to make sure I address it directly.", rebuttal2: "Makes sense. Can we get all three of us on a 20-minute call? I'll walk through exactly what it does, what it costs, and the ROI math — so you both have the same information going into the decision.", tip: "Get the three-way meeting. Don't let it become a game of telephone.", tipIcon: "👥" },
      { id: 218, category: "Decision", triggers: ["not the decision maker","not my decision","someone else decides","boss handles","owner decides","not up to me"], keywords: [["not","my","decision"],["someone","else","decides"],["owner","decides"]], rebuttal: "No problem — who's the right person to talk to about lead follow-up and customer communication? I want to make sure I'm not wasting anyone's time.", rebuttal2: "I appreciate you being straight with me. Can you point me to the owner or operations manager? I'll give them a tight 2-minute version — and if it doesn't fit, I'll be the one to say so.", tip: "Always get a name or a warm transfer. Never leave without a path to the decision maker.", tipIcon: "➡️" },
      { id: 219, category: "Stalling", triggers: ["let me think","need to think","think about it","not sure","give me time","sleep on it","have to consider"], keywords: [["think","about","it"],["need","think"],["sleep","on","it"]], rebuttal: "Of course. What's the main thing you need to think through — whether it will actually work for your type of business, or something else? I'd rather answer that question now than have you wonder about it.", rebuttal2: "Totally respect that. What would need to be true for this to be a clear yes? Because I'd rather know what the sticking point is and address it head-on.", tip: "Never accept 'think about it' without knowing what they're thinking about.", tipIcon: "💭" },
      { id: 220, category: "Stalling", triggers: ["complicated to set up","sounds complicated","hard to set up","too much work","implementation","don't have time to set up","takes too long to set up","i have to do it myself"], keywords: [["complicated","set","up"],["hard","set","up"],["too","much","work"],["do","it","myself"]], rebuttal: "We handle the entire setup for you — you don't touch anything. Our team configures your missed call text-back, follow-up sequences, CRM pipeline, and review automation. Most businesses are live in 48–72 hours. Your job is just to answer the calls that come in.", rebuttal2: "This is 100% done for you. We write the follow-up messages, set up the sequences, build the pipeline, and test everything before we go live. You review it, approve it, and we launch. You don't need to be technical at all.", tip: "Emphasize done-for-you setup aggressively. Every implementation concern evaporates when they realize they do nothing.", tipIcon: "🛠️" },
      { id: 221, category: "Stalling", triggers: ["how do i know it works","prove it works","show me results","do you have proof","does it actually work","any case studies","what results"], keywords: [["how","know","works"],["prove","it","works"],["show","results"],["case","studies"]], rebuttal: "Fair — I'd want proof too. Can I walk you through the numbers from a contractor in your trade in a similar market? Call volume before and after, response rate on the texts, and jobs booked from recovered missed calls.", rebuttal2: "Absolutely. We track everything — missed calls captured, text response rates, bookings created, reviews generated, revenue recovered. Can I pull up a real dashboard from a contractor similar to you?", tip: "Offer a live demo of a real dashboard. Seeing actual numbers closes this objection fast.", tipIcon: "📈" },
      { id: 222, category: "Stalling", triggers: ["what if customers don't book online","my clients don't book online","customers call not book","customers want to call","people want to talk to a person"], keywords: [["don't","book","online"],["customers","call"],["want","to","call"],["talk","person"]], rebuttal: "The system doesn't force them to book online — it just texts them back so they don't go cold. The text says 'Hey, it's [Your Name] from [Business]. Sorry I missed you! When's a good time to connect?' Most reply or call back. Very few actually book online.", rebuttal2: "Great point — and that's exactly how we set it up. The automated text is just a bridge to keep them warm until you can call them back. It's not replacing your phone calls — it's making sure leads don't disappear while you're on a job.", tip: "Clarify that it bridges to a phone call. The system doesn't replace human connection.", tipIcon: "📲" },
      { id: 223, category: "Stalling", triggers: ["i need to see it first","can i see a demo","want to see it first","show me how it works","demo","show me"], keywords: [["see","demo"],["see","it","first"],["show","me","how"],["want","demo"]], rebuttal: "Absolutely — that's exactly what I want to show you. Let me lock in a 20-minute screen share where I show you the system live, walk through what a missed call looks like from the customer's perspective, and pull up a real dashboard. When works this week?", rebuttal2: "Perfect — a demo is the best way. I'll pull up a live example from a contractor in your trade. Morning or afternoon this week?", tip: "A demo request is a buying signal. Close the meeting immediately.", tipIcon: "🎯" },
      { id: 224, category: "Positive", triggers: ["maybe","could be interested","sounds interesting","tell me more","i'm listening","go ahead","interested","want to know more","what does it do"], keywords: [["tell","more"],["sounds","interesting"],["could","interested"],["want","know","more"]], rebuttal: "Love it — let me lock in a 20-minute demo where I show you the system live. I'll walk through a real missed call scenario and pull up an actual contractor dashboard. Morning or afternoon this week?", rebuttal2: "Perfect. I'll send a calendar link right now — 20 minutes, I'll show you exactly what it looks like for a contractor in your trade. What's the best email to send it to?", tip: "CLOSE THE DEMO immediately. Don't keep explaining — book the meeting right now.", tipIcon: "🏆" }
    ]
  },
  universal: {
    id: "universal", name: "Universal Objections",
    subtitle: "Every objection · Any product · Any industry",
    price: "Any pitch", color: "#22c55e", icon: "🎯",
    objections: [
      // ── DISMISSIVE ──────────────────────────────────────────────────────────
      { id: 301, category: "Dismissive", triggers: ["not interested","no interest","don't need","not for me","no thanks","we're good","i'm good","doesn't interest","not interested in"], keywords: [["not","interested"],["don't","need","this"],["we're","good"]], rebuttal: "Totally fair — I'm not here to sell you something you don't need. Can I ask one question before I let you go? What would actually be useful for your business right now?", rebuttal2: "I hear you. What would it take for something like this to even be worth a conversation?", tip: "Ask what they DO want. Turns a rejection into discovery.", tipIcon: "🎯" },
      { id: 302, category: "Dismissive", triggers: ["too busy","bad time","can't talk","busy right now","not a good time","don't have time","no time","in a meeting","on another call","middle of something"], keywords: [["busy","right","now"],["don't","have","time"],["not","good","time"]], rebuttal: "Completely understand — I'll be quick. Give me 30 seconds and if it's not relevant I'll let you go immediately. Fair?", rebuttal2: "No worries — when's a better time today or tomorrow? Morning or afternoon? I'll put it in my calendar right now.", tip: "Always offer a specific time window. Vague follow-ups never happen.", tipIcon: "⚡" },
      { id: 303, category: "Dismissive", triggers: ["send me an email","email me","send me something","shoot me an email","send info","send me information","send me details","send me a brochure"], keywords: [["send","email"],["email","me"],["shoot","email"]], rebuttal: "Happy to — what specifically would be most useful for me to include? I want to make sure it's worth opening.", rebuttal2: "Will do. And what's the one question you'd want answered in that email so I make it relevant for you?", tip: "Qualify the email request. If they can't answer, they won't open it anyway.", tipIcon: "📧" },
      { id: 304, category: "Dismissive", triggers: ["is this a cold call","are you selling","what is this","who is this","why are you calling","what are you calling about","what's this about","is this a sales call"], keywords: [["selling","something"],["cold","call"],["what","calling","about"]], rebuttal: "Ha — yeah, I won't lie to you. But I only reach out when I think there's a genuine fit. Can I have 30 seconds to tell you why I called specifically?", rebuttal2: "You caught me. I'll be upfront — this is a business call. But I did my research before calling and I think there's something here worth 60 seconds. If not, I'll hang up myself.", tip: "Own it with humor and confidence. Never be defensive.", tipIcon: "😄" },
      { id: 305, category: "Dismissive", triggers: ["take me off","remove me","do not call","stop calling","take me off your list","remove from list","unsubscribe"], keywords: [["take","off","list"],["remove","me"],["stop","calling"]], rebuttal: "Absolutely — I'll do that right now. Before I do, can I ask one quick thing? Is it because you're already sorted in this area, or just not the right time?", rebuttal2: "Done, no problem. I just want to make sure I'm not removing someone who'd actually benefit. Are you currently happy with how things are going in [area]?", tip: "Honor it immediately. Then ask ONE curiosity question before hanging up.", tipIcon: "✅" },
      { id: 306, category: "Dismissive", triggers: ["get these calls","calls every day","calls all day","thousand calls","hundred calls","tons of calls","keep getting calls","always getting calls","calls like this all the time","calls all the time","get calls like this","calls like this","i get these calls","get a lot of calls","call like this","calls every single","getting these calls","get these kind of calls","get calls all"], keywords: [["get","calls","every","day"],["calls","all","day"],["so many","calls"],["calls","all","time"],["get","calls","like"],["i","get","these","calls"]], rebuttal: "Ha — I completely get it. So I'll skip the pitch and just ask one question: what's the one thing you wish worked better in your business right now?", rebuttal2: "You and literally every business owner I talk to. So let me make this different — I'll ask you one question and if the answer is 'we're totally fine,' I'll hang up myself. Deal?", tip: "Break the pattern. Don't pitch — ask a question they haven't heard before.", tipIcon: "😂" },
      { id: 307, category: "Dismissive", triggers: ["we don't do that","we don't need that","that doesn't apply","not relevant","doesn't apply to us","not applicable"], keywords: [["don't","do","that"],["doesn't","apply"],["not","relevant"]], rebuttal: "Fair enough — can I ask what you currently do instead? I want to understand your setup before assuming anything.", rebuttal2: "Makes sense. What would have to change in your business for something like this to become relevant?", tip: "Don't argue. Get curious. Find the real gap.", tipIcon: "🔍" },
      // ── TIMING ──────────────────────────────────────────────────────────────
      { id: 308, category: "Timing", triggers: ["call me back","try me later","follow up later","reach out later","check back","another time","try again later","call me in"], keywords: [["call","back"],["try","later"],["reach","back"]], rebuttal: "Happy to. Out of curiosity — what specifically needs to change before the timing is right? I want to make sure I follow up at exactly the right moment.", rebuttal2: "Of course. What day works best — beginning or end of the month? I'll lock it in right now.", tip: "Qualify every callback. 'Later' without a date means never.", tipIcon: "📅" },
      { id: 309, category: "Timing", triggers: ["not the right time","wrong time","bad timing","not now","not today","not ready","not ready yet","not a priority right now"], keywords: [["not","right","time"],["not","ready"],["not","priority"]], rebuttal: "Totally respect that. What would need to be true for the timing to feel right? Is it a budget thing, a bandwidth thing, or something else?", rebuttal2: "I hear that a lot. Can I ask — is it that the timing is off, or that this particular thing isn't a priority at all right now?", tip: "Diagnose the real reason. Timing is usually a proxy for something else.", tipIcon: "🕐" },
      { id: 310, category: "Timing", triggers: ["call me back next quarter","next quarter","next month","next year","beginning of the year","new year","q1","q2","q3","q4","new budget","new fiscal"], keywords: [["next","quarter"],["new","budget"],["beginning","year"]], rebuttal: "Makes sense to plan around budget cycles. Can I put something on the calendar now so we're not starting from zero when that time comes?", rebuttal2: "Totally. Can I send you a quick summary in the meantime so it's fresh when the conversation comes up internally?", tip: "Lock in a future date before ending the call. Don't leave empty-handed.", tipIcon: "📆" },
      { id: 311, category: "Timing", triggers: ["we're in a busy season","peak season","really slammed","overwhelmed right now","swamped","crazy busy right now","going through a lot"], keywords: [["busy","season"],["peak","season"],["really","slammed"]], rebuttal: "That's actually good news — it means business is happening. The best time to plan is when you're busy, not when things slow down. Can I get 5 minutes now or tomorrow?", rebuttal2: "Understood. When does your busy season typically wind down? I'll follow up right at that moment so the timing actually works.", tip: "Reframe busy as opportunity. Strike while there's momentum.", tipIcon: "🔥" },
      { id: 312, category: "Timing", triggers: ["we just made a decision","just signed a contract","just committed","already committed","locked in","just renewed"], keywords: [["just","signed"],["just","committed"],["already","locked"]], rebuttal: "That makes sense — I wouldn't want to complicate a fresh decision. When does that contract come up for renewal? I'd love to be in the conversation at that point.", rebuttal2: "Totally respect that. Can I ask what drove the decision? I'm genuinely curious — it helps me understand what matters most to businesses like yours.", tip: "Plant the seed for renewal. Ask about the decision to learn what they value.", tipIcon: "📋" },
      // ── BUDGET ──────────────────────────────────────────────────────────────
      { id: 313, category: "Budget", triggers: ["too expensive","costs too much","too much money","that's a lot","way too much","too pricey","can't justify","that's too much","more than expected","more than i thought"], keywords: [["too","expensive"],["too","much","money"],["cost","too","much"],["price","too","high"]], rebuttal: "Fair point on price — can I ask what you're currently spending to solve this same problem? Because sometimes the cost of NOT solving it is higher than the investment.", rebuttal2: "I hear you. What's your average revenue from one new customer or deal? Because if this gets you even one more of those, the math usually works pretty fast.", tip: "Make them calculate the cost of inaction. Don't defend the price — flip the frame.", tipIcon: "📊" },
      { id: 314, category: "Budget", triggers: ["no budget","don't have budget","no money","can't afford","not in the budget","budget is frozen","budget is gone","spent the budget"], keywords: [["no","budget"],["can't","afford"],["budget","frozen"],["don't","have","money"]], rebuttal: "Completely understand. Is it that there's no budget at all right now, or that this hasn't been prioritized yet? Because those are two different conversations.", rebuttal2: "That's fair. If the timing were right budget-wise, is this something you'd move forward on? I want to know if the fit is there before worrying about timing.", tip: "Separate 'no budget' from 'not a priority.' One is solvable, one isn't.", tipIcon: "💰" },
      { id: 315, category: "Budget", triggers: ["how much","what does it cost","what's the price","how much is it","what do you charge","pricing","what's the investment","what are your rates","what does this cost"], keywords: [["how","much"],["what","cost"],["what","price"],["what","charge"],["what","investment"]], rebuttal: "I'll absolutely share pricing — I want to give you context first so the number makes sense. What's the problem you're most trying to solve right now?", rebuttal2: "Pricing depends on your setup, but I'll walk you through it. First — what would success look like for you if this worked perfectly?", tip: "Never lead with price. Anchor value first, then the number lands differently.", tipIcon: "🏷️" },
      { id: 316, category: "Budget", triggers: ["cutting costs","reducing costs","tightening belt","reducing spend","watching spending","trying to save money","cost cutting","austerity"], keywords: [["cutting","costs"],["reducing","spend"],["tightening","budget"]], rebuttal: "That's actually why a lot of our best clients came to us — they were spending more in the wrong places and needed to consolidate. Can I show you how this compares to what you're currently paying?", rebuttal2: "Makes sense. What are you currently spending on solving this problem — even indirectly? Sometimes cutting costs in the right area frees up budget for the right investment.", tip: "Position as cost consolidation, not additional spend.", tipIcon: "✂️" },
      { id: 317, category: "Budget", triggers: ["need to see roi","show me the roi","what's the return","prove the roi","what's the return on investment","does this actually pay off","how does this pay off"], keywords: [["show","roi"],["prove","roi"],["return","investment"],["does","pay","off"]], rebuttal: "Totally reasonable ask. What does one new customer or deal worth to you? Because most clients see a payback in the first 30–60 days based on just that one metric.", rebuttal2: "I love that question — it's exactly the right one to ask. Let me walk you through how we measure it and what clients in your situation typically see. Can I do that in 5 minutes?", tip: "ROI questions are buying signals. Treat them as opportunities, not obstacles.", tipIcon: "📈" },
      // ── EXISTING SOLUTION ────────────────────────────────────────────────────
      { id: 318, category: "Existing Solution", triggers: ["already have someone","already working with","have an agency","have a vendor","have a provider","have a company","someone does that","have someone for that","have a person","have a guy"], keywords: [["already","have","someone"],["already","vendor"],["have","agency"]], rebuttal: "Good to hear — what do you like most about what they're doing? I ask because most people I talk to are getting good results in some areas but missing something in others.", rebuttal2: "Makes sense. I'm not asking you to switch — I'm asking if you'd be open to a comparison so you know you're getting the most out of what you have. Would that be useful?", tip: "Never compete directly. Find the gap in their current solution.", tipIcon: "🔍" },
      { id: 319, category: "Existing Solution", triggers: ["tried it before","tried something like that","tried this before","did this before","been there done that","tried similar","tried something similar"], keywords: [["tried","before"],["been","there"],["tried","similar"]], rebuttal: "I hear that a lot — and I always want to understand what happened. What did you try, and what fell short? Because there's a huge range in how these things are executed.", rebuttal2: "That's the most honest feedback I can get. What would have needed to be different for it to have worked?", tip: "Don't defend. Diagnose what went wrong. That's your differentiation.", tipIcon: "🛠️" },
      { id: 320, category: "Existing Solution", triggers: ["we do it in house","handle it ourselves","do it internally","in-house team","internal team does it","we have a team for that","we handle it ourselves"], keywords: [["in","house"],["do","it","ourselves"],["internal","team"]], rebuttal: "That's great — a lot of successful companies do. Can I ask, are you happy with the results, or is there an area where you feel like you're leaving something on the table?", rebuttal2: "Respect that. Who handles it internally? I ask because we work alongside a lot of in-house teams as a specialist layer — we're not trying to replace anyone.", tip: "Position as complement, not competition to their internal team.", tipIcon: "🏠" },
      { id: 321, category: "Existing Solution", triggers: ["happy with what we have","satisfied with current","works fine","works for us","don't want to change","if it ain't broke","no need to change"], keywords: [["happy","what","have"],["works","fine"],["satisfied","current"]], rebuttal: "That's genuinely great — and I believe you. Can I ask one thing though: is there one area where you think 'we could probably do better here if we had more time or resources'?", rebuttal2: "Glad to hear it. Quick question — if you could improve one thing about your current setup without any extra hassle, what would it be?", tip: "Find the crack. Everyone has one thing they wish worked better.", tipIcon: "😊" },
      // ── DECISION ────────────────────────────────────────────────────────────
      { id: 322, category: "Decision", triggers: ["not the decision maker","not my decision","someone else decides","don't make that decision","not up to me","above my pay grade","someone else handles that"], keywords: [["not","decision","maker"],["not","my","decision"],["someone","else","decides"]], rebuttal: "No problem at all — maybe you can help me out. Who's the right person to connect with about this? I want to make sure I'm not wasting your time or theirs.", rebuttal2: "I appreciate you being straight with me. Can you point me in the right direction — is it the owner, a director, or someone on the ops side?", tip: "Always leave with a name. Never hang up without knowing who to call next.", tipIcon: "➡️" },
      { id: 323, category: "Decision", triggers: ["talk to my partner","check with my partner","ask my wife","ask my husband","talk to my business partner","need to loop in my partner"], keywords: [["talk","partner"],["check","partner"],["loop","partner"]], rebuttal: "Of course — big decisions should be a team call. What's your partner's biggest concern usually when it comes to new investments? I want to make sure I address it.", rebuttal2: "Totally respect that. Can we set up a quick call with both of you? I'll keep it to 20 minutes and answer both your questions at the same time.", tip: "Get the decision meeting on the calendar before hanging up.", tipIcon: "👥" },
      { id: 324, category: "Decision", triggers: ["need to run it by my team","check with my team","need team approval","need committee approval","need to discuss internally","group decision","need to present internally"], keywords: [["run","by","team"],["team","approval"],["discuss","internally"]], rebuttal: "Makes sense — what would your team need to see to feel comfortable? I can put together something that makes that internal conversation easier.", rebuttal2: "Totally. What's your read on it personally? Because your perspective usually shapes how the team conversation goes.", tip: "Find out the champion's opinion first. They're your internal sales rep.", tipIcon: "🤔" },
      { id: 325, category: "Decision", triggers: ["how did you get my number","where did you get my number","how do you have my information","who gave you this number","where did you find me","how did you find me"], keywords: [["get","my","number"],["have","my","number"],["find","me"]], rebuttal: "Great question — your business is publicly listed and came up in my research. I only reach out when I think there's a genuine reason to. Is this a bad time to explain why?", rebuttal2: "Totally fair to ask. Your info is publicly available and you came up during research I was doing in your industry. I only call when I think there's a real fit.", tip: "Be confident and transparent. Never be defensive or evasive about this.", tipIcon: "🔎" },
      // ── STALLING ────────────────────────────────────────────────────────────
      { id: 326, category: "Stalling", triggers: ["let me think","need to think","think about it","think it over","need to consider","need some time","give me time","sleep on it","mull it over"], keywords: [["think","about","it"],["need","think"],["sleep","on","it"]], rebuttal: "Of course — what's the main thing you need to think through? Is it the investment, whether it'll actually work, or something else? I'd rather address it now.", rebuttal2: "Totally respect that. What would need to be true for this to be a clear yes when you do think it through?", tip: "Never accept 'think about it' without knowing what they're thinking about.", tipIcon: "💭" },
      { id: 327, category: "Stalling", triggers: ["need more information","send me more info","want to know more","need more details","can you send me something","want to research it"], keywords: [["need","more","info"],["want","know","more"],["more","details"]], rebuttal: "Absolutely — what specifically would be most useful? Case studies, pricing breakdown, how it works technically? I want to send you exactly what moves the needle for you.", rebuttal2: "Happy to. What's the one question that, if I answered it perfectly, would make this an easy decision?", tip: "Don't dump everything. Find the single thing that matters most to them.", tipIcon: "📋" },
      { id: 328, category: "Stalling", triggers: ["how do i know it works","prove it works","show me results","do you have proof","show me proof","any case studies","any testimonials","anyone else use this"], keywords: [["how","know","works"],["prove","it","works"],["show","results"],["case","studies"]], rebuttal: "Fair — I'd want proof too. Can I walk you through a specific example from a business similar to yours — what they tried, what happened, and what the result was?", rebuttal2: "Absolutely. What metric matters most to you — revenue, time saved, leads, cost reduction? I'll pull the most relevant example for your situation.", tip: "Proof questions are interest signals. Match the proof to their specific metric.", tipIcon: "📈" },
      { id: 329, category: "Stalling", triggers: ["got burned before","bad experience before","burned by a vendor","been disappointed","didn't deliver","overpromised","agency let me down","got scammed","wasted money before"], keywords: [["burned","before"],["bad","experience"],["didn't","deliver"],["over","promised"]], rebuttal: "I'm really sorry that happened — it's more common than it should be. Can I ask what they promised vs. what you actually got? Because knowing that tells me exactly how to be different.", rebuttal2: "That's a completely legitimate reason to be cautious. What would you need to see from us to feel safe giving it another shot — guarantees, references, a pilot program?", tip: "Validate fully. Then position your process as the antidote to what failed.", tipIcon: "🩹" },
      { id: 330, category: "Stalling", triggers: ["too complicated","too complex","hard to implement","too much work","hard to manage","another thing to manage","too much overhead","don't have bandwidth","don't have capacity"], keywords: [["too","complicated"],["too","much","work"],["don't","have","bandwidth"],["hard","manage"]], rebuttal: "I hear that — the last thing you need is something that creates more work. How much of your time would you say goes into managing this problem the way things work now?", rebuttal2: "Totally understand. What if I could show you that the setup is done for you and ongoing management takes less than 30 minutes a month? Would that change the calculus?", tip: "Sell simplicity. Show that you reduce their workload, not add to it.", tipIcon: "🎯" },
      // ── TRUST / CREDIBILITY ──────────────────────────────────────────────────
      { id: 331, category: "Trust", triggers: ["never heard of you","don't know your company","who are you","what company is this","i don't recognize","who is this company","what company do you work for"], keywords: [["never","heard","of","you"],["don't","know","company"],["who","are","you"]], rebuttal: "Totally fair — we're not a household name yet. What I can tell you is we work with businesses like yours in [industry] and the results speak for themselves. Want to hear one example?", rebuttal2: "Fair. We're not the biggest name, but we have a track record in your space. Would a few client references help? I can get you two or three businesses like yours to talk to directly.", tip: "Don't oversell. Offer references. Let results do the talking.", tipIcon: "🏢" },
      { id: 332, category: "Trust", triggers: ["how long have you been around","how long in business","are you a legitimate","is this legit","are you real","what's your track record"], keywords: [["how","long","business"],["track","record"],["are","you","real"]], rebuttal: "Great question — happy to share our background. We've been operating since [year] and have worked with [types of clients]. Would a quick overview help or would you rather speak with a client reference?", rebuttal2: "Totally fair to vet us. What would help you feel most confident — our client list, case studies, or talking directly to someone we work with?", tip: "Offer proof proactively. References are the fastest credibility builder.", tipIcon: "📜" },
      // ── POSITIVE / CLOSING ───────────────────────────────────────────────────
      { id: 333, category: "Positive", triggers: ["maybe","could be interested","possibly","might be interested","tell me more","sounds interesting","i'm listening","go ahead","interested","want to know more","what does it do","what is it"], keywords: [["tell","more"],["sounds","interesting"],["could","interested"],["want","know","more"]], rebuttal: "Perfect — let me lock in a time. What works better for you, morning or afternoon this week? I'll keep it to 20 minutes.", rebuttal2: "Love that. I'll send you a calendar link right now — 20 minutes, I'll show you exactly what this looks like for your specific situation.", tip: "CLOSE NOW. Stop pitching the moment you get a maybe — go straight to booking.", tipIcon: "🏆" }
    ]
  }
};

const DEFAULT_PRODUCTS = PRODUCTS;
const CATEGORIES = ["All","Dismissive","Timing","Budget","Existing Solution","Decision","Stalling","Trust","AI Skepticism","Positive"];

export default function App() {
  const [screen, setScreen] = useState("home");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [audioSource, setAudioSource] = useState(null);
  const [customObjections, setCustomObjections] = useState({});
  const [isListening, setIsListening] = useState(false);
  const [statusMsg, setStatusMsg] = useState("Press Start Coaching to begin");
  const [statusType, setStatusType] = useState("idle");
  const [transcript, setTranscript] = useState("");
  const [segments, setSegments] = useState([]);
  const [activeCard, setActiveCard] = useState(null);
  const [triggerCount, setTriggerCount] = useState({});
  const [streak, setStreak] = useState(0);
  const [callLog, setCallLog] = useState([]);
  const [callStartTime, setCallStartTime] = useState(null);
  const [sessionSummary, setSessionSummary] = useState(null);
  const [confidence, setConfidence] = useState(100);
  const [editingId, setEditingId] = useState(null);
  const [filterCat, setFilterCat] = useState("All");
  const [drillIndex, setDrillIndex] = useState(0);
  const [drillRevealed, setDrillRevealed] = useState(false);
  const [drillScore, setDrillScore] = useState({ correct: 0, total: 0 });
  const [newObjForm, setNewObjForm] = useState({ triggers: "", rebuttal: "", rebuttal2: "", tip: "", category: "Dismissive" });
  const [showAddForm, setShowAddForm] = useState(false);
  const [pulseCard, setPulseCard] = useState(false);
  const [diagMode, setDiagMode] = useState(false);
  const [aiMode, setAiMode] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);
  const [businessProfile, setBusinessProfile] = useState({ name: "", offer: "", valueProp: "", targetCustomer: "" });
  const [showProfileSetup, setShowProfileSetup] = useState(false);

  // ── PHASE 2 STATE ─────────────────────────────────────────────────────
  const [currentRep, setCurrentRep] = useState(null); // selected rep for this session
  const [teamRoster, setTeamRoster] = useState([]); // admin-loaded rep list
  const [allSessions, setAllSessions] = useState([]); // all historical sessions
  const [showRepSelect, setShowRepSelect] = useState(false);
  const [showRosterAdmin, setShowRosterAdmin] = useState(false);
  const [newRepName, setNewRepName] = useState("");
  const [leaderboardPeriod, setLeaderboardPeriod] = useState("week"); // week | month | all
  const [customProducts, setCustomProducts] = useState({}); // overrides for product name/desc/price/color
  const [showProductMgmt, setShowProductMgmt] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [newProductForm, setNewProductForm] = useState({ name: "", subtitle: "", price: "", color: "#6366f1", icon: "🎯" });
  const [showNewProductForm, setShowNewProductForm] = useState(false);
  const [customProductsList, setCustomProductsList] = useState([]); // user-created products

  const recognitionRef = useRef(null);
  const dismissTimer = useRef(null);
  const isListeningRef = useRef(false);
  const drillRef = useRef([]);

  // ── KEY FIX: track which segments have already been scanned ──
  const scannedSegmentsRef = useRef(new Set());
  // ── Track fired objections with timestamps per session ──
  const firedRef = useRef({}); // { objId: timestamp }
  // ── AI cooldown: prevent AI from firing too frequently ──
  const lastAiFiredRef = useRef(0);
  // ── Rolling transcript for AI context ──
  const fullTranscriptRef = useRef("");

  // Merge default products with any custom overrides + user-created products
  const allProducts = {
    ...Object.fromEntries(
      Object.entries(PRODUCTS)
        .filter(([key]) => !(customProducts[key] && customProducts[key]._hidden))
        .map(([key, p]) => [key, customProducts[key] ? { ...p, ...customProducts[key] } : p])
    ),
    ...Object.fromEntries(customProductsList.map(p => [p.id, p]))
  };
  const activeProduct = selectedProduct ? (allProducts[selectedProduct] || null) : null;
  const baseList = activeProduct ? activeProduct.objections : [];
  const customList = selectedProduct ? (customObjections[selectedProduct] || []) : [];
  const allObjList = [...baseList.map(o => { const c = customList.find(x => x.id === o.id); return c ? { ...o, ...c } : o; }), ...customList.filter(c => c.id > 900 && !c._deleted)].filter(o => !o._deleted);
  const filtered = filterCat === "All" ? allObjList : allObjList.filter(o => o.category === filterCat);
  const drillObj = drillRef.current[drillIndex % Math.max(1, drillRef.current.length)];

  const productColor = activeProduct?.color || "#6366f1";
  const confidenceColor = confidence > 66 ? "#22c55e" : confidence > 33 ? "#f59e0b" : "#ef4444";
  const confidenceLabel = confidence > 66 ? "STRONG" : confidence > 33 ? "HOLD" : "PIVOT";
  const sourceLabels = { mic: "🎙️ Headset Mic", system: "🔊 System Audio", speakerphone: "📱 Speakerphone" };
  const statusColor = { idle: "#475569", requesting: "#f59e0b", listening: "#22c55e", error: "#ef4444" }[statusType] || "#475569";

  // ── PHASE 2 COMPUTED ──────────────────────────────────────────────────
  const getLeaderboard = () => {
    const now = Date.now();
    const cutoff = leaderboardPeriod === "week" ? 7 : leaderboardPeriod === "month" ? 30 : 9999;
    const filtered = allSessions.filter(s => (now - s.timestamp) / 86400000 <= cutoff);
    const repStats = {};
    filtered.forEach(s => {
      if (!repStats[s.repName]) repStats[s.repName] = { name: s.repName, sessions: 0, objections: 0, streak: 0, totalDuration: 0 };
      repStats[s.repName].sessions++;
      repStats[s.repName].objections += s.objectionCount;
      repStats[s.repName].streak = Math.max(repStats[s.repName].streak, s.streak);
      repStats[s.repName].totalDuration += s.durationSecs || 0;
    });
    return Object.values(repStats).sort((a, b) => b.objections - a.objections);
  };

  const repSessions = currentRep ? allSessions.filter(s => s.repName === currentRep.name).slice().reverse() : [];

  const fireObjection = useCallback((obj, matchedText) => {
    const now = Date.now();
    const lastFired = firedRef.current[obj.id] || 0;
    // Hard cooldown: same objection cannot fire again within 15 seconds
    if (now - lastFired < 15000) return;
    firedRef.current[obj.id] = now;

    setTriggerCount(prev => {
      const count = (prev[obj.id] || 0) + 1;
      setActiveCard({ ...obj, useSecond: count > 1 });
      return { ...prev, [obj.id]: count };
    });
    setStreak(s => s + 1);
    setConfidence(c => Math.max(10, c - 8));
    setPulseCard(true);
    setTimeout(() => setPulseCard(false), 600);
    setCallLog(prev => [...prev, { category: obj.category, trigger: matchedText.slice(0, 40), time: new Date().toLocaleTimeString() }]);
    if (dismissTimer.current) clearTimeout(dismissTimer.current);
    dismissTimer.current = setTimeout(() => setActiveCard(null), 20000);
    setSegments(prev => [...prev.slice(-30), { text: `🎯 MATCH: "${obj.triggers[0]}" → ${obj.category}`, type: "match", time: new Date().toLocaleTimeString() }]);
  }, []);

  // ── AI REBUTTAL FALLBACK ─────────────────────────────────────────────────
  const fireAiRebuttal = useCallback(async (segmentText, context) => {
    const now = Date.now();
    if (now - lastAiFiredRef.current < 12000) return;
    lastAiFiredRef.current = now;
    setAiLoading(true);
    setSegments(prev => [...prev.slice(-30), { text: "🤖 AI analyzing objection...", type: "system", time: new Date().toLocaleTimeString() }]);

    try {
      // Call our Netlify serverless function (keeps API key secure on server)
      const resp = await fetch("/.netlify/functions/rebuttal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          segmentText,
          context,
          productName: activeProduct ? activeProduct.name : "our product",
          productDesc: activeProduct ? activeProduct.subtitle : "our service",
          businessProfile
        })
      });
      if (!resp.ok) throw new Error("Server error " + resp.status);
      const parsed = await resp.json();
      setAiLoading(false);
      const card = {
        id: "ai_" + Date.now(),
        category: parsed.objectionType || "AI Generated",
        triggers: [segmentText],
        rebuttal: parsed.rebuttal || "Stay curious and keep them talking.",
        rebuttal2: parsed.rebuttal || "Stay curious and keep them talking.",
        tip: parsed.tip || "Stay calm and confident.",
        tipIcon: parsed.tipIcon || "🤖",
        useSecond: false,
        isAiGenerated: true
      };
      setActiveCard(card);
      setStreak(s => s + 1);
      setConfidence(c => Math.max(10, c - 6));
      setPulseCard(true);
      setTimeout(() => setPulseCard(false), 600);
      setCallLog(prev => [...prev, { category: "🤖 " + card.category, trigger: segmentText.slice(0, 40), time: new Date().toLocaleTimeString() }]);
      if (dismissTimer.current) clearTimeout(dismissTimer.current);
      dismissTimer.current = setTimeout(() => setActiveCard(null), 25000);
      setSegments(prev => [...prev.slice(-30), { text: "🤖 AI rebuttal ready for: \"" + segmentText.slice(0, 35) + "\"", type: "match", time: new Date().toLocaleTimeString() }]);
    } catch (err) {
      setAiLoading(false);
      setSegments(prev => [...prev.slice(-30), { text: "⚠️ AI error — check connection", type: "error", time: new Date().toLocaleTimeString() }]);
    }
  }, [businessProfile, activeProduct]);

  // ── CORE: check NEW segments, smart dedup per match type ──────────────
  const checkNewSegment = useCallback((segmentText) => {
    if (!segmentText || segmentText.trim().length < 2) return;
    const key = segmentText.trim().toLowerCase().slice(0, 80);

    // Keep rolling transcript for AI context regardless
    fullTranscriptRef.current = (fullTranscriptRef.current + " " + segmentText).slice(-1500);

    // Check if we already processed this segment for PRESET matching
    const alreadyScanned = scannedSegmentsRef.current.has(key);

    if (!alreadyScanned) {
      scannedSegmentsRef.current.add(key);
      if (scannedSegmentsRef.current.size > 60) {
        const arr = Array.from(scannedSegmentsRef.current);
        scannedSegmentsRef.current = new Set(arr.slice(-60));
      }

      // STEP 1: instant preset match on new segments only
      for (const obj of allObjList) {
        if (matchesObjection(segmentText, obj)) {
          fireObjection(obj, segmentText);
          return; // preset matched — done
        }
      }
    }

    // STEP 2: AI fallback — runs if:
    // - AI mode is on
    // - segment is substantial (5+ words — real sentence, not a fragment)
    // - no active card showing right now
    // - AI not currently loading
    // Note: AI uses its OWN cooldown (lastAiFiredRef) so it can handle
    // phrases even if preset dedup already ran on them
    if (aiMode && !aiLoading && segmentText.trim().split(" ").length >= 5) {
      fireAiRebuttal(segmentText, fullTranscriptRef.current.slice(-800));
    }
  }, [allObjList, fireObjection, aiMode, aiLoading, fireAiRebuttal]);

  const stopListening = useCallback(() => {
    isListeningRef.current = false;
    setIsListening(false);
    setStatusType("idle");
    setStatusMsg("Stopped — press Start Coaching to resume");
    if (recognitionRef.current) { try { recognitionRef.current.stop(); } catch(e) {} recognitionRef.current = null; }
  }, []);

  const startRecognition = useCallback(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { setStatusType("error"); setStatusMsg("❌ Use Chrome or Edge — Safari not supported"); return; }
    setStatusType("requesting");
    setStatusMsg("Requesting microphone permission...");

    navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
      stream.getTracks().forEach(t => t.stop());
      setStatusType("listening");
      setStatusMsg("🟢 Listening — speak naturally");
      setIsListening(true);
      isListeningRef.current = true;

      const recognition = new SR();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setSegments(prev => [...prev.slice(-30), { text: "Recognition started", type: "system", time: new Date().toLocaleTimeString() }]);
      };

      recognition.onspeechstart = () => {
        setStatusMsg("🎤 Speech detected...");
      };

      recognition.onresult = (event) => {
        // ── ONLY process NEW results from event.resultIndex ──
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          const text = result[0].transcript.trim();
          if (!text) continue;

          if (result.isFinal) {
            // Final result: add to display transcript and check it
            setTranscript(prev => (prev + " " + text).slice(-400));
            setSegments(prev => [...prev.slice(-30), { text: `✅ "${text}"`, type: "final", time: new Date().toLocaleTimeString() }]);
            checkNewSegment(text);
          } else {
            // Interim result: show in transcript but DO NOT trigger objections
            // This prevents the same words from firing multiple times as they finalize
            setSegments(prev => {
              // Update last interim entry rather than adding new ones
              const last = prev[prev.length - 1];
              if (last && last.type === "interim") {
                return [...prev.slice(0, -1), { text: `⏳ "${text}"`, type: "interim", time: new Date().toLocaleTimeString() }];
              }
              return [...prev.slice(-30), { text: `⏳ "${text}"`, type: "interim", time: new Date().toLocaleTimeString() }];
            });
          }
        }
      };

      recognition.onerror = (e) => {
        setSegments(prev => [...prev.slice(-30), { text: `⚠️ ${e.error}`, type: "error", time: new Date().toLocaleTimeString() }]);
        if (e.error === "not-allowed") {
          setStatusType("error");
          setStatusMsg("❌ Mic denied — tap the lock icon in your browser address bar and allow microphone");
          stopListening();
        } else if (e.error === "no-speech") {
          setStatusMsg("🟢 Listening — no speech detected yet");
        }
      };

      recognition.onend = () => {
        setStatusMsg("🟢 Listening...");
        if (isListeningRef.current) {
          setTimeout(() => {
            if (isListeningRef.current && recognitionRef.current) {
              try { recognitionRef.current.start(); } catch(e) {}
            }
          }, 250);
        }
      };

      recognition.start();
      recognitionRef.current = recognition;
    }).catch(() => {
      setStatusType("error");
      setStatusMsg("❌ Mic access denied — tap the lock icon in your browser bar → allow microphone");
    });
  }, [checkNewSegment, stopListening]);

  const handleStartCoaching = () => {
    if (!selectedProduct) { setScreen("product-select"); return; }
    if (!audioSource) { setScreen("audio-select"); return; }
    if (!currentRep) { setShowRepSelect(true); return; }
    setScreen("coach");
    setTranscript(""); setSegments([]); setActiveCard(null);
    setTriggerCount({}); setStreak(0); setCallLog([]);
    setCallStartTime(Date.now()); setConfidence(100);
    // Reset fired tracking for new session
    firedRef.current = {};
    scannedSegmentsRef.current = new Set();
    lastAiFiredRef.current = 0;
    fullTranscriptRef.current = "";
    setTimeout(() => startRecognition(), 400);
  };

  const handleStopCoaching = () => {
    stopListening();
    const duration = Math.round((Date.now() - callStartTime) / 1000);
    const catCounts = {};
    callLog.forEach(l => { catCounts[l.category] = (catCounts[l.category] || 0) + 1; });
    const topCategory = Object.keys(catCounts).sort((a, b) => catCounts[b] - catCounts[a])[0] || "None";
    const summary = {
      duration: `${Math.floor(duration / 60)}m ${duration % 60}s`,
      objectionCount: callLog.length, streak, topCategory,
      log: callLog, product: activeProduct
    };
    setSessionSummary(summary);
    // Save session to history
    if (currentRep) {
      const session = {
        id: Date.now(),
        timestamp: Date.now(),
        repName: currentRep.name,
        productName: activeProduct ? activeProduct.name : "Unknown",
        productColor: activeProduct ? activeProduct.color : "#6366f1",
        objectionCount: callLog.length,
        streak,
        topCategory,
        durationSecs: duration,
        duration: summary.duration,
        log: callLog
      };
      setAllSessions(prev => [...prev, session]);
    }
    setScreen("summary");
  };

  const dismissCard = () => { if (dismissTimer.current) clearTimeout(dismissTimer.current); setActiveCard(null); setConfidence(c => Math.min(100, c + 5)); };
  const saveEdit = (id, field, value) => { setCustomObjections(prev => { const ex = prev[selectedProduct] || []; const idx = ex.findIndex(c => c.id === id); if (idx >= 0) { const u = [...ex]; u[idx] = { ...u[idx], [field]: value }; return { ...prev, [selectedProduct]: u }; } return { ...prev, [selectedProduct]: [...ex, { id, [field]: value }] }; }); };
  const addObjection = () => { if (!newObjForm.triggers || !newObjForm.rebuttal) return; const o = { id: Date.now(), category: newObjForm.category, triggers: newObjForm.triggers.split(",").map(t => t.trim().toLowerCase()), keywords: [], rebuttal: newObjForm.rebuttal, rebuttal2: newObjForm.rebuttal2 || newObjForm.rebuttal, tip: newObjForm.tip || "Stay calm and confident.", tipIcon: "💡" }; setCustomObjections(prev => ({ ...prev, [selectedProduct]: [...(prev[selectedProduct] || []), o] })); setNewObjForm({ triggers: "", rebuttal: "", rebuttal2: "", tip: "", category: "Dismissive" }); setShowAddForm(false); };
  const deleteObjection = (id) => setCustomObjections(prev => ({ ...prev, [selectedProduct]: [...(prev[selectedProduct] || []), { id, _deleted: true }] }));

  const S = {
    wrap: { position: "relative", zIndex: 1, maxWidth: 480, margin: "0 auto", padding: "24px 16px 110px" },
    card: { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, padding: 16 },
    btn: (color = "#6366f1") => ({ background: `linear-gradient(135deg, ${color}, ${color}cc)`, border: "none", borderRadius: 14, padding: "16px 20px", color: "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer", width: "100%", boxShadow: `0 6px 20px ${color}35` }),
    ghost: { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: "14px 20px", color: "#94a3b8", fontSize: 14, fontWeight: 600, cursor: "pointer", width: "100%" },
    back: { background: "none", border: "none", color: "#6366f1", cursor: "pointer", fontSize: 14, marginBottom: 22, padding: 0 },
    label: { fontSize: 10, color: "#475569", textTransform: "uppercase", letterSpacing: 1.5, display: "block", marginBottom: 5 },
    ta: { width: "100%", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "9px 11px", color: "#E8EDF5", fontSize: 13, resize: "vertical", minHeight: 58, boxSizing: "border-box", fontFamily: "inherit" },
    fixedBottom: { position: "fixed", bottom: 0, left: 0, right: 0, padding: "12px 16px", background: "linear-gradient(transparent, #080C14 40%)", zIndex: 10 }
  };

  return (
    <div style={{ fontFamily: "'DM Sans',sans-serif", background: "#080C14", minHeight: "100vh", color: "#E8EDF5" }}>
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", background: `radial-gradient(ellipse 60% 40% at 20% 10%, ${productColor}10 0%, transparent 70%), radial-gradient(ellipse 50% 40% at 80% 90%, rgba(245,158,11,0.05) 0%, transparent 70%)` }} />

      {/* HOME */}
      {screen === "home" && (
        <div style={S.wrap}>
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <div style={{ fontSize: 11, letterSpacing: 4, color: "#6366f1", fontWeight: 700, marginBottom: 10, textTransform: "uppercase" }}>Objection Coach</div>
            <h1 style={{ fontSize: 32, fontWeight: 800, margin: "0 0 8px", letterSpacing: -1 }}>Real-Time Sales <span style={{ color: "#f59e0b" }}>Coach</span></h1>
            <p style={{ color: "#64748b", fontSize: 14, margin: "0 0 16px" }}>AI-powered objection detection for live calls</p>
            <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
              {selectedProduct ? (
                <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: `${productColor}18`, border: `1px solid ${productColor}40`, borderRadius: 99, padding: "5px 12px" }}>
                  <span>{activeProduct.icon}</span>
                  <span style={{ fontSize: 12, color: productColor, fontWeight: 600 }}>{activeProduct.name}</span>
                  <button onClick={() => setScreen("product-select")} style={{ background: "none", border: "none", color: productColor, cursor: "pointer", fontSize: 11, padding: 0, opacity: 0.7 }}>Change</button>
                </div>
              ) : (
                <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)", borderRadius: 99, padding: "5px 12px" }}>
                  <span style={{ fontSize: 12, color: "#ef4444", fontWeight: 600 }}>⚠ Select a product first</span>
                </div>
              )}
              {audioSource && (
                <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.25)", borderRadius: 99, padding: "5px 12px" }}>
                  <span style={{ fontSize: 12, color: "#a5b4fc", fontWeight: 600 }}>{sourceLabels[audioSource]}</span>
                  <button onClick={() => setScreen("audio-select")} style={{ background: "none", border: "none", color: "#6366f1", cursor: "pointer", fontSize: 11, padding: 0, opacity: 0.7 }}>Change</button>
                </div>
              )}
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 22 }}>
            {[{ label: "Objections", value: allObjList.length || "—", icon: "🎯" }, { label: "Categories", value: selectedProduct ? [...new Set(allObjList.map(o => o.category))].length : "—", icon: "📂" }, { label: "Rebuttals", value: allObjList.length ? allObjList.length * 2 : "—", icon: "⚡" }].map(s => (
              <div key={s.label} style={{ ...S.card, textAlign: "center", padding: "14px 8px" }}>
                <div style={{ fontSize: 20, marginBottom: 4 }}>{s.icon}</div>
                <div style={{ fontSize: 20, fontWeight: 800, color: "#f59e0b" }}>{s.value}</div>
                <div style={{ fontSize: 10, color: "#475569", textTransform: "uppercase", letterSpacing: 1 }}>{s.label}</div>
              </div>
            ))}
          </div>
          {/* Rep selector */}
          <div onClick={() => setShowRepSelect(true)} style={{ ...S.card, padding: "12px 16px", marginBottom: 14, cursor: "pointer", border: currentRep ? "1px solid rgba(34,197,94,0.3)" : "1px solid rgba(239,68,68,0.3)", background: currentRep ? "rgba(34,197,94,0.06)" : "rgba(239,68,68,0.05)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 20 }}>👤</span>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: currentRep ? "#22c55e" : "#ef4444" }}>{currentRep ? currentRep.name : "No Rep Selected"}</div>
                <div style={{ fontSize: 11, color: "#475569" }}>{currentRep ? "Tap to switch rep" : "Tap to select rep before coaching"}</div>
              </div>
            </div>
            <span style={{ fontSize: 12, color: "#475569" }}>›</span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <button onClick={() => setScreen("product-select")} style={{ ...S.btn(productColor), display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
              {activeProduct ? <><span>{activeProduct.icon}</span>Change Product</> : <><span>🎯</span>Select Product to Pitch</>}
            </button>
            <button onClick={handleStartCoaching} style={{ ...S.btn("#6366f1"), display: "flex", alignItems: "center", justifyContent: "center", gap: 10, opacity: selectedProduct && audioSource ? 1 : 0.5 }}>
              <span style={{ fontSize: 20 }}>🎙️</span>Start Live Coaching
            </button>
            {/* Phase 2 Nav */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <button onClick={() => setScreen("leaderboard")} style={{ background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.3)", borderRadius: 14, padding: "13px", color: "#f59e0b", fontSize: 13, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                🏆 Leaderboard
              </button>
              <button onClick={() => setScreen("dashboard")} style={{ background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.3)", borderRadius: 14, padding: "13px", color: "#a5b4fc", fontSize: 13, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                📊 Dashboard
              </button>
            </div>
            <button onClick={() => setScreen("audio-select")} style={{ background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.2)", borderRadius: 14, padding: "13px", color: "#22c55e", fontSize: 14, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
              🔊 Audio Source Setup
            </button>
            <button onClick={() => selectedProduct ? setScreen("drill") : setScreen("product-select")} style={{ background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.3)", borderRadius: 14, padding: "13px", color: "#f59e0b", fontSize: 14, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
              🏋️ Objection Drill Mode
            </button>
            <button onClick={() => setScreen("roster")} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: "13px", color: "#64748b", fontSize: 13, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
              👥 Team Roster
            </button>
            <button onClick={() => selectedProduct ? setScreen("admin") : setScreen("product-select")} style={{ ...S.ghost, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
              ⚙️ Manage Objections
            </button>
          </div>
        </div>
      )}

      {/* PRODUCT SELECT */}
      {screen === "product-select" && (
        <div style={S.wrap}>
          <button onClick={() => setScreen("home")} style={S.back}>← Back</button>
          <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 6 }}>What are you pitching?</h2>
          <p style={{ color: "#475569", fontSize: 13, marginBottom: 28 }}>Select the product your rep is selling. Only that product's rebuttals will fire during the call.</p>
          {Object.values(allProducts).map(p => (
            <div key={p.id} onClick={() => { setSelectedProduct(p.id); drillRef.current = [...(p.objections || [])].sort(() => Math.random() - 0.5); setDrillIndex(0); }} style={{ ...S.card, padding: 20, marginBottom: 12, cursor: "pointer", border: selectedProduct === p.id ? `1px solid ${p.color}70` : "1px solid rgba(255,255,255,0.07)", background: selectedProduct === p.id ? `${p.color}0c` : "rgba(255,255,255,0.04)", transition: "all 0.15s" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div style={{ display: "flex", gap: 14 }}>
                  <div style={{ fontSize: 28 }}>{p.icon}</div>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 4, color: selectedProduct === p.id ? p.color : "#E8EDF5" }}>{p.name}</div>
                    <div style={{ fontSize: 12, color: "#64748b", marginBottom: 8 }}>{p.subtitle}</div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <span style={{ background: `${p.color}18`, color: p.color, fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 99 }}>{p.price}</span>
                      <span style={{ background: "rgba(255,255,255,0.06)", color: "#64748b", fontSize: 11, padding: "3px 10px", borderRadius: 99 }}>{(p.objections || []).length} objections</span>
                    </div>
                  </div>
                </div>
                <div style={{ fontSize: 18, color: selectedProduct === p.id ? "#22c55e" : "transparent" }}>✓</div>
              </div>
            </div>
          ))}
          <button onClick={() => setScreen("manage-products")} style={{ width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: "13px", color: "#64748b", fontSize: 13, fontWeight: 600, cursor: "pointer", marginBottom: 10 }}>⚙️ Manage Products</button>
          {selectedProduct && <button onClick={() => setScreen(audioSource ? "home" : "audio-select")} style={{ ...S.btn(productColor), marginTop: 4 }}>{activeProduct?.icon} Confirm — Use {activeProduct?.name}</button>}
        </div>
      )}

      {/* AUDIO SELECT */}
      {screen === "audio-select" && (
        <div style={S.wrap}>
          <button onClick={() => setScreen("home")} style={S.back}>← Back</button>
          <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 6 }}>Audio Source</h2>
          <p style={{ color: "#475569", fontSize: 13, marginBottom: 24 }}>Choose how the app listens to your calls.</p>
          {[
            { id: "speakerphone", icon: "📱", title: "Speakerphone Mode", desc: "Call on mobile speakerphone. Mic picks up both voices. Zero setup.", b1c: "#22c55e", b1: "✓ No Setup", b2: "Best for mobile callers" },
            { id: "mic", icon: "🎙️", title: "Headset / Browser Mic", desc: "Use laptop or headset mic. Best for softphone desk callers.", b1c: "#22c55e", b1: "✓ No Setup", b2: "Best for desk callers" },
            { id: "system", icon: "🔊", title: "System Audio (Dialer)", desc: "Routes dialer audio through a virtual driver. Captures both voices.", b1c: "#f87171", b1: "⚙ One-Time Setup", b2: "Best for desktop dialers" }
          ].map(opt => (
            <div key={opt.id} onClick={() => setAudioSource(opt.id)} style={{ ...S.card, padding: 18, marginBottom: 10, cursor: "pointer", border: audioSource === opt.id ? "1px solid rgba(99,102,241,0.5)" : "1px solid rgba(255,255,255,0.07)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div style={{ display: "flex", gap: 14 }}>
                  <div style={{ fontSize: 26 }}>{opt.icon}</div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 5 }}>{opt.title}</div>
                    <div style={{ fontSize: 12, color: "#64748b", marginBottom: 8 }}>{opt.desc}</div>
                    <div style={{ display: "flex", gap: 6 }}>
                      <span style={{ background: `${opt.b1c}18`, color: opt.b1c, fontSize: 10, fontWeight: 700, padding: "3px 9px", borderRadius: 99 }}>{opt.b1}</span>
                      <span style={{ background: "rgba(245,158,11,0.1)", color: "#f59e0b", fontSize: 10, fontWeight: 600, padding: "3px 9px", borderRadius: 99 }}>{opt.b2}</span>
                    </div>
                  </div>
                </div>
                <div style={{ fontSize: 18, color: audioSource === opt.id ? "#22c55e" : "transparent" }}>✓</div>
              </div>
            </div>
          ))}
          {audioSource === "speakerphone" && (
            <div style={{ marginTop: 12, marginBottom: 16 }}>
              <div style={{ ...S.card, background: "rgba(34,197,94,0.05)", border: "1px solid rgba(34,197,94,0.15)", padding: 14, marginBottom: 8 }}>
                <div style={{ fontSize: 12, color: "#22c55e", fontWeight: 700, marginBottom: 8 }}>📱 + 💻 App on Laptop, Calls on Phone</div>
                {["Put phone on speaker, place 12–18 inches from laptop mic","Keep volume at 70–80%","Quiet room = better accuracy","Use Chrome or Edge"].map((t, i) => (
                  <div key={i} style={{ display: "flex", gap: 8, marginBottom: 6 }}>
                    <div style={{ minWidth: 18, height: 18, borderRadius: "50%", background: "rgba(34,197,94,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 800, color: "#22c55e", flexShrink: 0 }}>{i+1}</div>
                    <div style={{ fontSize: 12, color: "#64748b" }}>{t}</div>
                  </div>
                ))}
              </div>
              <div style={{ ...S.card, background: "rgba(99,102,241,0.05)", border: "1px solid rgba(99,102,241,0.15)", padding: 14 }}>
                <div style={{ fontSize: 12, color: "#a5b4fc", fontWeight: 700, marginBottom: 8 }}>📱 App on Phone, Calls on Same Phone</div>
                {["Switch call to speakerphone — mic picks up both voices automatically","Keep app open in Chrome or Edge","Step away from loud areas if possible"].map((t, i) => (
                  <div key={i} style={{ display: "flex", gap: 8, marginBottom: 6 }}>
                    <div style={{ minWidth: 18, height: 18, borderRadius: "50%", background: "rgba(99,102,241,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 800, color: "#a5b4fc", flexShrink: 0 }}>{i+1}</div>
                    <div style={{ fontSize: 12, color: "#64748b" }}>{t}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {audioSource && <button onClick={() => setScreen("home")} style={{ ...S.btn(), marginTop: 8 }}>✓ Confirm — Use {sourceLabels[audioSource]}</button>}
        </div>
      )}

      {/* COACH */}
      {screen === "coach" && (
        <div style={{ ...S.wrap, paddingBottom: 110 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 9, height: 9, borderRadius: "50%", background: statusColor, boxShadow: isListening ? `0 0 10px ${statusColor}` : "none", animation: isListening ? "pulseGlow 1.5s infinite" : "none" }} />
              <span style={{ fontSize: 11, fontWeight: 700, color: statusColor, textTransform: "uppercase", letterSpacing: 1 }}>{isListening ? "Listening" : "Stopped"}</span>
              <span style={{ fontSize: 10, color: productColor, background: `${productColor}15`, padding: "2px 8px", borderRadius: 99, fontWeight: 600 }}>{activeProduct?.icon} {activeProduct?.name}</span>
            </div>
            <div style={{ display: "flex", gap: 14 }}>
              <div style={{ textAlign: "center" }}><div style={{ fontSize: 15, fontWeight: 800, color: "#f59e0b" }}>🔥 {streak}</div><div style={{ fontSize: 9, color: "#475569", textTransform: "uppercase" }}>Streak</div></div>
              <div style={{ textAlign: "center" }}><div style={{ fontSize: 15, fontWeight: 800, color: productColor }}>{callLog.length}</div><div style={{ fontSize: 9, color: "#475569", textTransform: "uppercase" }}>Handled</div></div>
            </div>
          </div>

          <div style={{ ...S.card, padding: "10px 14px", marginBottom: 10 }}>
            <div style={{ fontSize: 11, color: "#64748b", marginBottom: 6 }}>{statusMsg}</div>
            <div style={{ background: "rgba(255,255,255,0.06)", borderRadius: 99, height: 6 }}>
              <div style={{ height: "100%", borderRadius: 99, width: `${confidence}%`, background: confidenceColor, transition: "all 0.5s ease" }} />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
              <span style={{ fontSize: 10, color: "#334155" }}>Call Confidence</span>
              <span style={{ fontSize: 10, fontWeight: 800, color: confidenceColor }}>{confidenceLabel}</span>
            </div>
          </div>

          {aiLoading && !activeCard && (
            <div style={{ background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.25)", borderRadius: 16, padding: "14px 18px", marginBottom: 12, display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 16, height: 16, borderRadius: "50%", border: "2px solid #6366f1", borderTopColor: "transparent", animation: "spin 0.8s linear infinite", flexShrink: 0 }} />
              <span style={{ fontSize: 13, color: "#a5b4fc", fontWeight: 600 }}>🤖 AI analyzing objection in real time...</span>
            </div>
          )}
          {activeCard && (
            <div style={{ background: activeCard.isAiGenerated ? "linear-gradient(135deg, rgba(99,102,241,0.2), rgba(99,102,241,0.08))" : `linear-gradient(135deg, ${productColor}18, ${productColor}06)`, border: activeCard.isAiGenerated ? "2px solid rgba(99,102,241,0.6)" : `2px solid ${productColor}50`, borderRadius: 20, padding: 18, marginBottom: 12, animation: pulseCard ? "cardPop 0.3s ease" : "slideUp 0.3s ease", boxShadow: activeCard.isAiGenerated ? "0 12px 40px rgba(99,102,241,0.25)" : `0 12px 40px ${productColor}20` }}>
              <div style={{ display: "flex", gap: 7, marginBottom: 10, flexWrap: "wrap", alignItems: "center" }}>
                <span style={{ background: "rgba(239,68,68,0.18)", color: "#ef4444", fontSize: 10, fontWeight: 700, padding: "3px 9px", borderRadius: 99, textTransform: "uppercase" }}>{activeCard.category}</span>
                {activeCard.isAiGenerated && <span style={{ background: "rgba(99,102,241,0.25)", color: "#a5b4fc", fontSize: 10, fontWeight: 700, padding: "3px 9px", borderRadius: 99 }}>🤖 AI GENERATED</span>}
                {activeCard.useSecond && !activeCard.isAiGenerated && <span style={{ background: "rgba(245,158,11,0.18)", color: "#f59e0b", fontSize: 10, fontWeight: 700, padding: "3px 9px", borderRadius: 99 }}>ESCALATED ↑</span>}
              </div>
              <div style={{ fontSize: 10, color: activeCard.isAiGenerated ? "#a5b4fc" : productColor, fontWeight: 700, letterSpacing: 2, marginBottom: 8, textTransform: "uppercase" }}>{activeCard.isAiGenerated ? "🤖 AI Rebuttal" : "🎯 Say This"}</div>
              <div style={{ background: "rgba(255,255,255,0.05)", borderRadius: 10, padding: "12px 14px", fontSize: 15, lineHeight: 1.65, fontWeight: 500, color: "#E8EDF5", marginBottom: 10 }}>
                {activeCard.useSecond ? activeCard.rebuttal2 : activeCard.rebuttal}
              </div>
              <div style={{ fontSize: 12, color: "#94a3b8", fontStyle: "italic", marginBottom: 12 }}>{activeCard.tipIcon} {activeCard.tip}</div>
              <button onClick={dismissCard} style={{ width: "100%", background: `${productColor}25`, border: `1px solid ${productColor}40`, borderRadius: 10, padding: "11px", color: productColor, fontSize: 14, fontWeight: 700, cursor: "pointer" }}>Got it ✓</button>
            </div>
          )}

          <div style={{ ...S.card, marginBottom: 10, minHeight: 60 }}>
            <div style={{ fontSize: 9, color: "#334155", textTransform: "uppercase", letterSpacing: 2, marginBottom: 5 }}>Live Transcript</div>
            <p style={{ color: "#475569", fontSize: 13, lineHeight: 1.6, margin: 0 }}>{transcript.slice(-300) || "Speak naturally — listening for objections..."}</p>
          </div>

          <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
            <button onClick={() => setAiMode(!aiMode)} style={{ flex: 1, background: aiMode ? "rgba(99,102,241,0.15)" : "rgba(255,255,255,0.04)", border: aiMode ? "1px solid rgba(99,102,241,0.4)" : "1px solid rgba(255,255,255,0.08)", borderRadius: 10, padding: "8px 12px", color: aiMode ? "#a5b4fc" : "#475569", fontSize: 11, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
              🤖 AI Fallback {aiMode ? "ON" : "OFF"}
            </button>
            <button onClick={() => setShowProfileSetup(!showProfileSetup)} style={{ flex: 1, background: (businessProfile.name || businessProfile.offer) ? "rgba(34,197,94,0.1)" : "rgba(255,255,255,0.04)", border: (businessProfile.name || businessProfile.offer) ? "1px solid rgba(34,197,94,0.3)" : "1px solid rgba(255,255,255,0.08)", borderRadius: 10, padding: "8px 12px", color: (businessProfile.name || businessProfile.offer) ? "#22c55e" : "#475569", fontSize: 11, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
              🏢 {businessProfile.name || "Business Profile"}
            </button>
          </div>

          {showProfileSetup && (
            <div style={{ background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: 14, marginBottom: 10 }}>
              <div style={{ fontSize: 11, color: "#22c55e", fontWeight: 700, marginBottom: 10, textTransform: "uppercase", letterSpacing: 1 }}>🏢 Business Profile — Personalizes AI Rebuttals</div>
              {[
                { key: "name", label: "Company Name", ph: "e.g. Xecutive Marketing" },
                { key: "offer", label: "What You Sell", ph: "e.g. Local SEO & AI automation for contractors" },
                { key: "valueProp", label: "#1 Value Proposition", ph: "e.g. We get contractors to the top of Google Maps" },
                { key: "targetCustomer", label: "Target Customer", ph: "e.g. HVAC, plumbing, roofing contractors in Phoenix" }
              ].map(f => (
                <div key={f.key} style={{ marginBottom: 8 }}>
                  <label style={{ fontSize: 9, color: "#475569", textTransform: "uppercase", letterSpacing: 1, display: "block", marginBottom: 3 }}>{f.label}</label>
                  <input value={businessProfile[f.key]} onChange={e => setBusinessProfile(p => ({ ...p, [f.key]: e.target.value }))} placeholder={f.ph} style={{ width: "100%", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "7px 10px", color: "#E8EDF5", fontSize: 12, boxSizing: "border-box", fontFamily: "inherit" }} />
                </div>
              ))}
              <button onClick={() => setShowProfileSetup(false)} style={{ width: "100%", background: "rgba(34,197,94,0.15)", border: "1px solid rgba(34,197,94,0.3)", borderRadius: 8, padding: "8px", color: "#22c55e", fontSize: 12, fontWeight: 700, cursor: "pointer", marginTop: 4 }}>Save Profile ✓</button>
            </div>
          )}

          <button onClick={() => setDiagMode(!diagMode)} style={{ width: "100%", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 10, padding: "8px", color: "#334155", fontSize: 11, cursor: "pointer", marginBottom: diagMode ? 8 : 10 }}>
            {diagMode ? "▲ Hide" : "▼ Show"} Diagnostic Log
          </button>
          {diagMode && (
            <div style={{ background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, padding: 12, marginBottom: 10 }}>
              <div style={{ fontSize: 10, color: "#475569", marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }}>Recognition Events</div>
              {segments.length === 0 ? <p style={{ fontSize: 12, color: "#334155", margin: 0 }}>No events yet. Start speaking.</p> : segments.slice(-10).reverse().map((s, i) => (
                <div key={i} style={{ display: "flex", gap: 8, marginBottom: 4 }}>
                  <span style={{ fontSize: 10, color: "#334155", minWidth: 55 }}>{s.time}</span>
                  <span style={{ fontSize: 12, color: s.type === "match" ? "#22c55e" : s.type === "error" ? "#ef4444" : s.type === "final" ? "#64748b" : "#475569", lineHeight: 1.4 }}>{s.text}</span>
                </div>
              ))}
              <div style={{ marginTop: 10, paddingTop: 10, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                <div style={{ fontSize: 10, color: "#475569", marginBottom: 6 }}>QUICK TEST — tap to simulate:</div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {["not interested","too much money","too busy","call me back","already have someone"].map(phrase => (
                    <button key={phrase} onClick={() => { checkNewSegment(phrase); setTranscript(p => p + " " + phrase); setSegments(p => [...p.slice(-30), { text: `🧪 "${phrase}"`, type: "system", time: new Date().toLocaleTimeString() }]); }} style={{ background: "rgba(99,102,241,0.15)", border: "1px solid rgba(99,102,241,0.3)", borderRadius: 8, padding: "5px 10px", color: "#a5b4fc", fontSize: 11, cursor: "pointer" }}>
                      "{phrase}"
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {callLog.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 9, color: "#334155", textTransform: "uppercase", letterSpacing: 2, marginBottom: 8 }}>Handled This Call</div>
              {callLog.slice(-4).reverse().map((l, i) => (
                <div key={i} style={{ ...S.card, padding: "8px 14px", marginBottom: 6, display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 12, color: "#64748b" }}>"{l.trigger}"</span>
                  <span style={{ fontSize: 10, color: "#334155" }}>{l.time}</span>
                </div>
              ))}
            </div>
          )}

          <div style={S.fixedBottom}>
            <div style={{ maxWidth: 480, margin: "0 auto", display: "flex", gap: 10 }}>
              <button onClick={handleStopCoaching} style={{ ...S.btn("#ef4444"), flex: 1 }}>■ End Call & Summary</button>
              <button onClick={() => { stopListening(); setScreen("home"); }} style={{ ...S.ghost, width: "auto", padding: "16px 18px" }}>←</button>
            </div>
          </div>
        </div>
      )}

      {/* SUMMARY */}
      {screen === "summary" && sessionSummary && (
        <div style={S.wrap}>
          <div style={{ marginBottom: 20 }}>
            <h2 style={{ fontSize: 24, fontWeight: 800, margin: "0 0 8px" }}>Call Summary</h2>
            {sessionSummary.product && <span style={{ background: `${sessionSummary.product.color}18`, color: sessionSummary.product.color, fontSize: 12, fontWeight: 600, padding: "3px 10px", borderRadius: 99 }}>{sessionSummary.product.icon} {sessionSummary.product.name}</span>}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 18 }}>
            {[{ label: "Duration", value: sessionSummary.duration, icon: "⏱️" }, { label: "Objections", value: sessionSummary.objectionCount, icon: "🎯" }, { label: "Best Streak", value: sessionSummary.streak, icon: "🔥" }, { label: "Top Category", value: sessionSummary.topCategory, icon: "📊" }].map(s => (
              <div key={s.label} style={{ ...S.card, padding: 14 }}>
                <div style={{ fontSize: 18, marginBottom: 5 }}>{s.icon}</div>
                <div style={{ fontSize: 17, fontWeight: 800, color: "#f59e0b", marginBottom: 2 }}>{s.value}</div>
                <div style={{ fontSize: 10, color: "#475569", textTransform: "uppercase", letterSpacing: 1 }}>{s.label}</div>
              </div>
            ))}
          </div>
          {sessionSummary.log.length > 0 && (
            <div style={{ ...S.card, marginBottom: 18 }}>
              <div style={{ fontSize: 10, color: "#475569", textTransform: "uppercase", letterSpacing: 2, marginBottom: 10 }}>Objections Log</div>
              {sessionSummary.log.map((l, i) => (
                <div key={i} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)", paddingBottom: 7, marginBottom: 7 }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontSize: 12, color: "#94a3b8" }}>"{l.trigger}"</span>
                    <span style={{ fontSize: 10, color: "#334155" }}>{l.time}</span>
                  </div>
                  <div style={{ fontSize: 11, color: "#475569", marginTop: 2 }}>{l.category}</div>
                </div>
              ))}
            </div>
          )}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <button onClick={handleStartCoaching} style={{ ...S.btn(productColor), display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>🎙️ Start New Call</button>
            <button onClick={() => setScreen("history")} style={{ background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.25)", borderRadius: 14, padding: "14px", color: "#a5b4fc", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>📋 View My Call History</button>
            <button onClick={() => setScreen("home")} style={S.ghost}>← Back to Home</button>
          </div>
        </div>
      )}

      {/* DRILL */}
      {screen === "drill" && drillObj && (
        <div style={S.wrap}>
          <button onClick={() => setScreen("home")} style={S.back}>← Back</button>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <div>
              <h2 style={{ fontSize: 24, fontWeight: 800, margin: "0 0 6px" }}>Drill Mode</h2>
              <span style={{ background: `${productColor}18`, color: productColor, fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 99 }}>{activeProduct?.icon} {activeProduct?.name}</span>
            </div>
            <div style={{ textAlign: "right" }}><div style={{ fontSize: 22, fontWeight: 800, color: "#22c55e" }}>{drillScore.correct}/{drillScore.total}</div><div style={{ fontSize: 10, color: "#475569" }}>Score</div></div>
          </div>
          <div style={{ ...S.card, padding: 20, marginBottom: 12 }}>
            <div style={{ fontSize: 10, color: "#f59e0b", textTransform: "uppercase", letterSpacing: 2, fontWeight: 700, marginBottom: 10 }}>Prospect Says:</div>
            <div style={{ fontSize: 18, fontWeight: 700, lineHeight: 1.4, marginBottom: 10 }}>"{drillObj.triggers[0]}"</div>
            <span style={{ background: `${productColor}18`, color: productColor, fontSize: 11, padding: "3px 10px", borderRadius: 99 }}>{drillObj.category}</span>
          </div>
          {!drillRevealed ? (
            <button onClick={() => setDrillRevealed(true)} style={S.btn(productColor)}>Reveal Rebuttal</button>
          ) : (
            <div>
              <div style={{ background: "rgba(34,197,94,0.07)", border: "1px solid rgba(34,197,94,0.2)", borderRadius: 14, padding: 16, marginBottom: 12 }}>
                <div style={{ fontSize: 10, color: "#22c55e", fontWeight: 700, textTransform: "uppercase", letterSpacing: 2, marginBottom: 8 }}>Best Rebuttal:</div>
                <p style={{ fontSize: 14, lineHeight: 1.65, color: "#E8EDF5", margin: "0 0 8px" }}>{drillObj.rebuttal}</p>
                <p style={{ fontSize: 12, color: "#64748b", margin: 0, fontStyle: "italic" }}>{drillObj.tipIcon} {drillObj.tip}</p>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <button onClick={() => { setDrillScore(s => ({ correct: s.correct + 1, total: s.total + 1 })); setDrillIndex(i => i + 1); setDrillRevealed(false); }} style={{ background: "rgba(34,197,94,0.15)", border: "1px solid rgba(34,197,94,0.3)", borderRadius: 12, padding: "13px", color: "#22c55e", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>✓ Got It</button>
                <button onClick={() => { setDrillScore(s => ({ ...s, total: s.total + 1 })); setDrillIndex(i => i + 1); setDrillRevealed(false); }} style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 12, padding: "13px", color: "#ef4444", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>✗ Review Again</button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ADMIN */}
      {screen === "admin" && (
        <div style={{ ...S.wrap, maxWidth: 540 }}>
          <button onClick={() => setScreen("home")} style={S.back}>← Back</button>
          <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 4 }}>Objection Library</h2>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
            <span style={{ background: `${productColor}18`, color: productColor, fontSize: 12, fontWeight: 600, padding: "3px 10px", borderRadius: 99 }}>{activeProduct?.icon} {activeProduct?.name}</span>
            <span style={{ fontSize: 12, color: "#475569" }}>{filtered.length} objections</span>
          </div>
          <div style={{ display: "flex", gap: 6, overflowX: "auto", marginBottom: 14, paddingBottom: 4 }}>
            {CATEGORIES.map(c => <button key={c} onClick={() => setFilterCat(c)} style={{ background: filterCat === c ? `${productColor}25` : "rgba(255,255,255,0.04)", border: filterCat === c ? `1px solid ${productColor}50` : "1px solid rgba(255,255,255,0.07)", borderRadius: 99, padding: "5px 12px", color: filterCat === c ? productColor : "#64748b", fontSize: 11, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap" }}>{c}</button>)}
          </div>
          <button onClick={() => setShowAddForm(!showAddForm)} style={{ width: "100%", background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.3)", borderRadius: 12, padding: "12px", color: "#f59e0b", fontSize: 13, fontWeight: 700, cursor: "pointer", marginBottom: 12 }}>+ Add New Objection</button>
          {showAddForm && (
            <div style={{ ...S.card, padding: 16, marginBottom: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 12, color: "#f59e0b" }}>New Objection</div>
              {[{ key: "triggers", label: "Trigger Phrases (comma separated)", ph: "not interested, no interest" }, { key: "rebuttal", label: "Primary Rebuttal", ph: "Your response..." }, { key: "rebuttal2", label: "Escalated Rebuttal", ph: "Stronger follow-up..." }, { key: "tip", label: "Coaching Tip", ph: "How to deliver this..." }].map(f => (
                <div key={f.key} style={{ marginBottom: 10 }}>
                  <label style={S.label}>{f.label}</label>
                  <textarea value={newObjForm[f.key]} onChange={e => setNewObjForm(p => ({ ...p, [f.key]: e.target.value }))} placeholder={f.ph} style={S.ta} />
                </div>
              ))}
              <div style={{ marginBottom: 12 }}>
                <label style={S.label}>Category</label>
                <select value={newObjForm.category} onChange={e => setNewObjForm(p => ({ ...p, category: e.target.value }))} style={{ ...S.ta, minHeight: "auto", resize: "none" }}>
                  {CATEGORIES.filter(c => c !== "All").map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <button onClick={addObjection} style={S.btn("#22c55e")}>Save Objection</button>
            </div>
          )}
          {filtered.map(obj => (
            <div key={obj.id} style={{ ...S.card, marginBottom: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <span style={{ background: `${productColor}18`, color: productColor, fontSize: 10, padding: "3px 9px", borderRadius: 99, fontWeight: 600 }}>{obj.category}</span>
                <div style={{ display: "flex", gap: 6 }}>
                  <button onClick={() => setEditingId(editingId === obj.id ? null : obj.id)} style={{ background: `${productColor}18`, border: "none", borderRadius: 7, padding: "4px 10px", color: productColor, fontSize: 11, cursor: "pointer" }}>Edit</button>
                  <button onClick={() => deleteObjection(obj.id)} style={{ background: "rgba(239,68,68,0.1)", border: "none", borderRadius: 7, padding: "4px 10px", color: "#ef4444", fontSize: 11, cursor: "pointer" }}>Delete</button>
                </div>
              </div>
              <div style={{ fontSize: 11, color: "#475569", marginBottom: 8 }}><strong style={{ color: "#64748b" }}>Triggers:</strong> {obj.triggers.join(", ")}</div>
              {editingId === obj.id ? (
                <div>
                  {[{ f: "rebuttal", l: "Primary Rebuttal" }, { f: "rebuttal2", l: "Escalated Rebuttal" }, { f: "tip", l: "Coaching Tip" }].map(x => (
                    <div key={x.f} style={{ marginBottom: 8 }}>
                      <label style={S.label}>{x.l}</label>
                      <textarea defaultValue={obj[x.f]} onChange={e => saveEdit(obj.id, x.f, e.target.value)} style={S.ta} />
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ fontSize: 12, color: "#94a3b8", lineHeight: 1.5 }}>{obj.rebuttal?.length > 90 ? obj.rebuttal.slice(0, 90) + "..." : obj.rebuttal}</div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* MANAGE PRODUCTS */}
      {screen === "manage-products" && (
        <div style={{ ...S.wrap, maxWidth: 540 }}>
          <button onClick={() => setScreen("product-select")} style={S.back}>← Back</button>
          <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>⚙️ Manage Products</h2>
          <p style={{ color: "#475569", fontSize: 13, marginBottom: 20 }}>Rename, recolor, or add new products for your sales team.</p>

          {/* Edit existing products */}
          <div style={{ fontSize: 11, color: "#475569", textTransform: "uppercase", letterSpacing: 2, marginBottom: 12 }}>Edit Existing Products</div>
          {Object.values(PRODUCTS).map(p => {
            const override = customProducts[p.id] || {};
            const current = { ...p, ...override };
            const isEditing = editingProduct === p.id;
            return (
              <div key={p.id} style={{ ...S.card, marginBottom: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: isEditing ? 14 : 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: 22 }}>{current.icon}</span>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 14, color: current.color }}>{current.name}</div>
                      <div style={{ fontSize: 11, color: "#475569" }}>{current.price}</div>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 6 }}>
                    <button onClick={() => setEditingProduct(isEditing ? null : p.id)} style={{ background: isEditing ? "rgba(99,102,241,0.2)" : "rgba(255,255,255,0.06)", border: "none", borderRadius: 8, padding: "5px 12px", color: isEditing ? "#a5b4fc" : "#64748b", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>{isEditing ? "Done" : "Edit"}</button>
                    <button onClick={() => { if (window.confirm("Hide this product from the selector?")) { setCustomProducts(prev => ({ ...prev, [p.id]: { ...(prev[p.id] || {}), _hidden: true } })); }}} style={{ background: "rgba(239,68,68,0.1)", border: "none", borderRadius: 8, padding: "5px 10px", color: "#ef4444", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>Hide</button>
                  </div>
                </div>
                {isEditing && (
                  <div>
                    {[
                      { key: "name", label: "Product Name", ph: p.name },
                      { key: "subtitle", label: "Subtitle / Description", ph: p.subtitle },
                      { key: "price", label: "Price", ph: p.price },
                      { key: "icon", label: "Icon (emoji)", ph: p.icon }
                    ].map(f => (
                      <div key={f.key} style={{ marginBottom: 10 }}>
                        <label style={{ fontSize: 10, color: "#475569", textTransform: "uppercase", letterSpacing: 1, display: "block", marginBottom: 4 }}>{f.label}</label>
                        <input
                          value={override[f.key] !== undefined ? override[f.key] : p[f.key]}
                          onChange={e => setCustomProducts(prev => ({ ...prev, [p.id]: { ...(prev[p.id] || {}), [f.key]: e.target.value } }))}
                          placeholder={f.ph}
                          style={{ width: "100%", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "8px 11px", color: "#E8EDF5", fontSize: 13, boxSizing: "border-box", fontFamily: "inherit" }}
                        />
                      </div>
                    ))}
                    <div style={{ marginBottom: 10 }}>
                      <label style={{ fontSize: 10, color: "#475569", textTransform: "uppercase", letterSpacing: 1, display: "block", marginBottom: 4 }}>Accent Color</label>
                      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                        <input type="color" value={override.color || p.color} onChange={e => setCustomProducts(prev => ({ ...prev, [p.id]: { ...(prev[p.id] || {}), color: e.target.value } }))} style={{ width: 44, height: 36, borderRadius: 8, border: "none", cursor: "pointer", background: "none" }} />
                        <span style={{ fontSize: 12, color: "#64748b" }}>{override.color || p.color}</span>
                      </div>
                    </div>
                    <button onClick={() => { setCustomProducts(prev => { const n = { ...prev }; delete n[p.id]; return n; }); }} style={{ fontSize: 11, color: "#ef4444", background: "none", border: "none", cursor: "pointer", padding: 0 }}>↺ Reset to default</button>
                  </div>
                )}
              </div>
            );
          })}

          {/* Custom products */}
          {customProductsList.length > 0 && (
            <div style={{ marginTop: 8 }}>
              <div style={{ fontSize: 11, color: "#475569", textTransform: "uppercase", letterSpacing: 2, marginBottom: 12 }}>Custom Products</div>
              {customProductsList.map(p => (
                <div key={p.id} style={{ ...S.card, padding: "14px 16px", marginBottom: 8, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: 22 }}>{p.icon}</span>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 14, color: p.color }}>{p.name}</div>
                      <div style={{ fontSize: 11, color: "#475569" }}>{p.price} · {(p.objections || []).length} objections</div>
                    </div>
                  </div>
                  <button onClick={() => setCustomProductsList(prev => prev.filter(x => x.id !== p.id))} style={{ background: "rgba(239,68,68,0.1)", border: "none", borderRadius: 8, padding: "5px 10px", color: "#ef4444", fontSize: 11, cursor: "pointer" }}>Delete</button>
                </div>
              ))}
            </div>
          )}

          {/* Add new product */}
          <div style={{ marginTop: 16 }}>
            <div style={{ fontSize: 11, color: "#475569", textTransform: "uppercase", letterSpacing: 2, marginBottom: 12 }}>Add New Product</div>
            <button onClick={() => setShowNewProductForm(!showNewProductForm)} style={{ width: "100%", background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.3)", borderRadius: 12, padding: "12px", color: "#f59e0b", fontSize: 13, fontWeight: 700, cursor: "pointer", marginBottom: 12 }}>
              {showNewProductForm ? "▲ Cancel" : "+ Add New Product"}
            </button>
            {showNewProductForm && (
              <div style={{ ...S.card, padding: 16 }}>
                {[
                  { key: "name", label: "Product Name", ph: "e.g. Starter Package" },
                  { key: "subtitle", label: "Subtitle", ph: "e.g. Basic plan for small teams" },
                  { key: "price", label: "Price", ph: "e.g. $299/mo" },
                  { key: "icon", label: "Icon (emoji)", ph: "🎯" }
                ].map(f => (
                  <div key={f.key} style={{ marginBottom: 10 }}>
                    <label style={{ fontSize: 10, color: "#475569", textTransform: "uppercase", letterSpacing: 1, display: "block", marginBottom: 4 }}>{f.label}</label>
                    <input value={newProductForm[f.key]} onChange={e => setNewProductForm(p => ({ ...p, [f.key]: e.target.value }))} placeholder={f.ph} style={{ width: "100%", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "8px 11px", color: "#E8EDF5", fontSize: 13, boxSizing: "border-box", fontFamily: "inherit" }} />
                  </div>
                ))}
                <div style={{ marginBottom: 12 }}>
                  <label style={{ fontSize: 10, color: "#475569", textTransform: "uppercase", letterSpacing: 1, display: "block", marginBottom: 4 }}>Accent Color</label>
                  <input type="color" value={newProductForm.color} onChange={e => setNewProductForm(p => ({ ...p, color: e.target.value }))} style={{ width: 44, height: 36, borderRadius: 8, border: "none", cursor: "pointer" }} />
                </div>
                <button onClick={() => {
                  if (!newProductForm.name) return;
                  const newP = {
                    id: "custom_" + Date.now(),
                    name: newProductForm.name,
                    subtitle: newProductForm.subtitle || "Custom product",
                    price: newProductForm.price || "Custom",
                    color: newProductForm.color,
                    icon: newProductForm.icon || "🎯",
                    objections: []
                  };
                  setCustomProductsList(prev => [...prev, newP]);
                  setNewProductForm({ name: "", subtitle: "", price: "", color: "#6366f1", icon: "🎯" });
                  setShowNewProductForm(false);
                }} style={{ ...S.btn("#22c55e") }}>Create Product</button>
                <p style={{ fontSize: 11, color: "#475569", marginTop: 8, textAlign: "center" }}>After creating, go to Manage Objections to add objections to this product.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* REP SELECT MODAL */}
      {showRepSelect && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 100, display: "flex", alignItems: "flex-end" }}>
          <div style={{ background: "#0F1420", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "20px 20px 0 0", width: "100%", padding: "24px 20px 40px", maxWidth: 480, margin: "0 auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h3 style={{ fontSize: 18, fontWeight: 800, margin: 0 }}>Who's making calls?</h3>
              <button onClick={() => setShowRepSelect(false)} style={{ background: "none", border: "none", color: "#475569", fontSize: 20, cursor: "pointer" }}>✕</button>
            </div>
            {teamRoster.length === 0 ? (
              <div style={{ textAlign: "center", padding: "20px 0" }}>
                <div style={{ fontSize: 32, marginBottom: 12 }}>👥</div>
                <p style={{ color: "#475569", fontSize: 14, marginBottom: 16 }}>No reps loaded yet. Go to Team Roster to add your team.</p>
                <button onClick={() => { setShowRepSelect(false); setScreen("roster"); }} style={{ background: "rgba(99,102,241,0.15)", border: "1px solid rgba(99,102,241,0.3)", borderRadius: 12, padding: "12px 24px", color: "#a5b4fc", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>Go to Team Roster</button>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {teamRoster.map(rep => (
                  <div key={rep.id} onClick={() => { setCurrentRep(rep); setShowRepSelect(false); }} style={{ background: currentRep && currentRep.id === rep.id ? "rgba(99,102,241,0.15)" : "rgba(255,255,255,0.04)", border: currentRep && currentRep.id === rep.id ? "1px solid rgba(99,102,241,0.4)" : "1px solid rgba(255,255,255,0.07)", borderRadius: 14, padding: "14px 16px", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{ width: 38, height: 38, borderRadius: "50%", background: "rgba(99,102,241,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 800, color: "#a5b4fc" }}>{rep.name[0]}</div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 14 }}>{rep.name}</div>
                        <div style={{ fontSize: 11, color: "#475569" }}>{rep.role || "Sales Rep"}</div>
                      </div>
                    </div>
                    {currentRep && currentRep.id === rep.id && <span style={{ color: "#22c55e", fontSize: 18 }}>✓</span>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TEAM ROSTER */}
      {screen === "roster" && (
        <div style={S.wrap}>
          <button onClick={() => setScreen("home")} style={S.back}>← Back</button>
          <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>Team Roster</h2>
          <p style={{ color: "#475569", fontSize: 13, marginBottom: 20 }}>Add your reps here so they can be tracked and ranked.</p>
          <div style={{ ...S.card, padding: 16, marginBottom: 16 }}>
            <div style={{ fontSize: 12, color: "#f59e0b", fontWeight: 700, marginBottom: 12 }}>Add New Rep</div>
            <div style={{ display: "flex", gap: 8 }}>
              <input value={newRepName} onChange={e => setNewRepName(e.target.value)} onKeyDown={e => { if (e.key === "Enter" && newRepName.trim()) { setTeamRoster(prev => [...prev, { id: Date.now(), name: newRepName.trim(), role: "Sales Rep" }]); setNewRepName(""); }}} placeholder="Rep name..." style={{ flex: 1, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: "10px 12px", color: "#E8EDF5", fontSize: 14, fontFamily: "inherit" }} />
              <button onClick={() => { if (newRepName.trim()) { setTeamRoster(prev => [...prev, { id: Date.now(), name: newRepName.trim(), role: "Sales Rep" }]); setNewRepName(""); }}} style={{ background: "rgba(34,197,94,0.15)", border: "1px solid rgba(34,197,94,0.3)", borderRadius: 10, padding: "10px 16px", color: "#22c55e", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>Add</button>
            </div>
          </div>
          {teamRoster.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px 20px", color: "#334155" }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>👥</div>
              <p style={{ fontSize: 14 }}>No reps added yet. Add your first rep above.</p>
            </div>
          ) : (
            teamRoster.map(rep => (
              <div key={rep.id} style={{ ...S.card, padding: "14px 16px", marginBottom: 8, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(99,102,241,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, fontWeight: 800, color: "#a5b4fc" }}>{rep.name[0]}</div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>{rep.name}</div>
                    <div style={{ fontSize: 11, color: "#475569" }}>{rep.role}</div>
                  </div>
                </div>
                <button onClick={() => setTeamRoster(prev => prev.filter(r => r.id !== rep.id))} style={{ background: "rgba(239,68,68,0.1)", border: "none", borderRadius: 8, padding: "5px 10px", color: "#ef4444", fontSize: 11, cursor: "pointer" }}>Remove</button>
              </div>
            ))
          )}
        </div>
      )}

      {/* LEADERBOARD */}
      {screen === "leaderboard" && (
        <div style={S.wrap}>
          <button onClick={() => setScreen("home")} style={S.back}>← Back</button>
          <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>🏆 Leaderboard</h2>
          <p style={{ color: "#475569", fontSize: 13, marginBottom: 16 }}>Rankings based on objections handled</p>
          <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
            {[["week","This Week"],["month","This Month"],["all","All Time"]].map(([val,label]) => (
              <button key={val} onClick={() => setLeaderboardPeriod(val)} style={{ flex: 1, background: leaderboardPeriod === val ? "rgba(245,158,11,0.2)" : "rgba(255,255,255,0.04)", border: leaderboardPeriod === val ? "1px solid rgba(245,158,11,0.4)" : "1px solid rgba(255,255,255,0.07)", borderRadius: 10, padding: "8px", color: leaderboardPeriod === val ? "#f59e0b" : "#64748b", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>{label}</button>
            ))}
          </div>
          {getLeaderboard().length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px 20px" }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>🏆</div>
              <p style={{ color: "#334155", fontSize: 14 }}>No sessions recorded yet. Start coaching to see rankings.</p>
            </div>
          ) : (
            getLeaderboard().map((rep, i) => (
              <div key={rep.name} style={{ ...S.card, padding: "16px", marginBottom: 10, border: i === 0 ? "1px solid rgba(245,158,11,0.3)" : "1px solid rgba(255,255,255,0.07)", background: i === 0 ? "rgba(245,158,11,0.06)" : "rgba(255,255,255,0.04)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <div style={{ fontSize: i === 0 ? 28 : 20, minWidth: 36, textAlign: "center" }}>{i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `#${i+1}`}</div>
                  <div style={{ width: 40, height: 40, borderRadius: "50%", background: i === 0 ? "rgba(245,158,11,0.2)" : "rgba(99,102,241,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 800, color: i === 0 ? "#f59e0b" : "#a5b4fc" }}>{rep.name[0]}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 800, fontSize: 15, color: i === 0 ? "#f59e0b" : "#E8EDF5" }}>{rep.name}</div>
                    <div style={{ fontSize: 11, color: "#475569" }}>{rep.sessions} session{rep.sessions !== 1 ? "s" : ""} · Best streak: {rep.streak}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 22, fontWeight: 800, color: i === 0 ? "#f59e0b" : "#6366f1" }}>{rep.objections}</div>
                    <div style={{ fontSize: 10, color: "#475569", textTransform: "uppercase" }}>Handled</div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* MANAGER DASHBOARD */}
      {screen === "dashboard" && (
        <div style={S.wrap}>
          <button onClick={() => setScreen("home")} style={S.back}>← Back</button>
          <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>📊 Manager Dashboard</h2>
          <p style={{ color: "#475569", fontSize: 13, marginBottom: 20 }}>Team-wide performance overview</p>
          {/* Team stats */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 20 }}>
            {[
              { label: "Total Sessions", value: allSessions.length, icon: "📞" },
              { label: "Total Objections", value: allSessions.reduce((a,s) => a + s.objectionCount, 0), icon: "🎯" },
              { label: "Active Reps", value: new Set(allSessions.map(s => s.repName)).size, icon: "👤" },
              { label: "Avg Objections/Call", value: allSessions.length ? Math.round(allSessions.reduce((a,s) => a + s.objectionCount, 0) / allSessions.length) : 0, icon: "📈" }
            ].map(s => (
              <div key={s.label} style={{ ...S.card, padding: 14 }}>
                <div style={{ fontSize: 20, marginBottom: 6 }}>{s.icon}</div>
                <div style={{ fontSize: 22, fontWeight: 800, color: "#f59e0b" }}>{s.value}</div>
                <div style={{ fontSize: 10, color: "#475569", textTransform: "uppercase", letterSpacing: 1 }}>{s.label}</div>
              </div>
            ))}
          </div>
          {/* Recent sessions */}
          <div style={{ fontSize: 12, color: "#475569", textTransform: "uppercase", letterSpacing: 2, marginBottom: 12 }}>Recent Sessions</div>
          {allSessions.length === 0 ? (
            <div style={{ textAlign: "center", padding: "30px 20px", color: "#334155" }}>
              <div style={{ fontSize: 36, marginBottom: 10 }}>📊</div>
              <p style={{ fontSize: 14 }}>No sessions recorded yet. Start coaching to see data here.</p>
            </div>
          ) : (
            [...allSessions].reverse().slice(0, 10).map(s => (
              <div key={s.id} style={{ ...S.card, padding: "12px 14px", marginBottom: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 32, height: 32, borderRadius: "50%", background: `${s.productColor}20`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 800, color: s.productColor || "#6366f1" }}>{s.repName[0]}</div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 13 }}>{s.repName}</div>
                      <div style={{ fontSize: 11, color: "#475569" }}>{s.productName} · {s.duration}</div>
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 16, fontWeight: 800, color: "#6366f1" }}>{s.objectionCount}</div>
                    <div style={{ fontSize: 10, color: "#475569" }}>handled</div>
                  </div>
                </div>
                {s.topCategory !== "None" && <div style={{ marginTop: 6, fontSize: 11, color: "#475569" }}>Top: {s.topCategory} · Streak: {s.streak}</div>}
              </div>
            ))
          )}
        </div>
      )}

      {/* CALL HISTORY (per rep) */}
      {screen === "history" && (
        <div style={S.wrap}>
          <button onClick={() => setScreen("home")} style={S.back}>← Back</button>
          <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>📋 Call History</h2>
          <p style={{ color: "#475569", fontSize: 13, marginBottom: 16 }}>{currentRep ? currentRep.name + "'s sessions" : "Select a rep to view history"}</p>
          {!currentRep ? (
            <div style={{ textAlign: "center", padding: "30px 20px" }}>
              <p style={{ color: "#334155" }}>No rep selected. Go back and select a rep first.</p>
            </div>
          ) : repSessions.length === 0 ? (
            <div style={{ textAlign: "center", padding: "30px 20px" }}>
              <div style={{ fontSize: 36, marginBottom: 10 }}>📋</div>
              <p style={{ color: "#334155", fontSize: 14 }}>No sessions yet for {currentRep.name}. Start coaching to build history.</p>
            </div>
          ) : (
            repSessions.map(s => (
              <div key={s.id} style={{ ...S.card, marginBottom: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>{s.productName}</div>
                    <div style={{ fontSize: 11, color: "#475569" }}>{new Date(s.timestamp).toLocaleDateString()} · {s.duration}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 20, fontWeight: 800, color: "#f59e0b" }}>{s.objectionCount}</div>
                    <div style={{ fontSize: 10, color: "#475569" }}>handled</div>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <span style={{ background: "rgba(245,158,11,0.1)", color: "#f59e0b", fontSize: 11, padding: "3px 8px", borderRadius: 99 }}>🔥 Streak: {s.streak}</span>
                  {s.topCategory !== "None" && <span style={{ background: "rgba(99,102,241,0.1)", color: "#a5b4fc", fontSize: 11, padding: "3px 8px", borderRadius: 99 }}>Top: {s.topCategory}</span>}
                </div>
                {s.log && s.log.length > 0 && (
                  <div style={{ marginTop: 10, borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 8 }}>
                    {s.log.slice(0, 4).map((l, i) => (
                      <div key={i} style={{ fontSize: 11, color: "#475569", marginBottom: 3 }}>"{l.trigger}" → {l.category}</div>
                    ))}
                    {s.log.length > 4 && <div style={{ fontSize: 11, color: "#334155" }}>+{s.log.length - 4} more</div>}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      <style>{`
        @keyframes pulseGlow{0%,100%{opacity:1;box-shadow:0 0 10px #22c55e}50%{opacity:0.5;box-shadow:0 0 3px #22c55e}}
        @keyframes slideUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
        @keyframes cardPop{0%{transform:scale(1)}50%{transform:scale(1.015)}100%{transform:scale(1)}}
        @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
        *{box-sizing:border-box}
        textarea:focus,select:focus{outline:1px solid rgba(99,102,241,0.5)}
        ::-webkit-scrollbar{width:4px;height:4px}
        ::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.1);border-radius:99px}
      `}</style>
    </div>
  );
}
