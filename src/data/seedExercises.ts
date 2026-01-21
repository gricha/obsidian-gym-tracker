import { Exercise } from '../types';

export const SEED_EXERCISES: Exercise[] = [
  // ============ CHEST ============
  {
    id: 'barbell-bench-press',
    name: 'Barbell Bench Press',
    muscles: { primary: ['chest'], secondary: ['triceps', 'shoulders'] },
    type: 'compound',
    equipment: 'barbell',
    alternatives: ['dumbbell-bench-press', 'machine-chest-press'],
    description: `## How to Perform
1. Lie flat on bench with feet firmly planted
2. Grip bar slightly wider than shoulder width
3. Unrack and lower bar to mid-chest with control
4. Press up explosively, locking out at top

## Cues
- Retract shoulder blades and maintain arch
- "Bend the bar" to engage lats
- Keep elbows at 45-75 degree angle`,
  },
  {
    id: 'dumbbell-bench-press',
    name: 'Dumbbell Bench Press',
    muscles: { primary: ['chest'], secondary: ['triceps', 'shoulders'] },
    type: 'compound',
    equipment: 'dumbbell',
    alternatives: ['barbell-bench-press', 'machine-chest-press'],
    description: `## How to Perform
1. Sit on bench with dumbbells on thighs
2. Kick back and position dumbbells at chest level
3. Press up, bringing dumbbells together at top
4. Lower with control to chest level

## Cues
- Greater range of motion than barbell
- Can rotate wrists for comfort
- Good for addressing imbalances`,
  },
  {
    id: 'incline-barbell-bench-press',
    name: 'Incline Barbell Bench Press',
    muscles: { primary: ['chest'], secondary: ['shoulders', 'triceps'] },
    type: 'compound',
    equipment: 'barbell',
    alternatives: ['incline-dumbbell-bench-press', 'incline-machine-press'],
    description: `## How to Perform
1. Set bench to 30-45 degree incline
2. Grip bar slightly wider than shoulder width
3. Lower to upper chest
4. Press up to lockout

## Cues
- Emphasizes upper chest and front delts
- Don't go too steep (becomes shoulder press)
- Keep shoulder blades retracted`,
  },
  {
    id: 'incline-dumbbell-bench-press',
    name: 'Incline Dumbbell Bench Press',
    muscles: { primary: ['chest'], secondary: ['shoulders', 'triceps'] },
    type: 'compound',
    equipment: 'dumbbell',
    alternatives: ['incline-barbell-bench-press'],
    description: `## How to Perform
1. Set bench to 30-45 degree incline
2. Press dumbbells up from shoulder level
3. Lower with control, feeling stretch in upper chest

## Cues
- Great for upper chest development
- Allows natural wrist rotation`,
  },
  {
    id: 'decline-bench-press',
    name: 'Decline Bench Press',
    muscles: { primary: ['chest'], secondary: ['triceps'] },
    type: 'compound',
    equipment: 'barbell',
    alternatives: ['decline-dumbbell-press', 'dips'],
    description: `## How to Perform
1. Secure legs at end of decline bench
2. Lower bar to lower chest
3. Press back up to lockout

## Cues
- Emphasizes lower chest
- Reduced shoulder strain vs flat bench`,
  },
  {
    id: 'dumbbell-flyes',
    name: 'Dumbbell Flyes',
    muscles: { primary: ['chest'], secondary: [] },
    type: 'isolation',
    equipment: 'dumbbell',
    alternatives: ['cable-flyes', 'pec-deck'],
    description: `## How to Perform
1. Lie on flat bench with dumbbells above chest
2. With slight bend in elbows, lower arms out to sides
3. Feel stretch in chest, then bring back together

## Cues
- Keep slight elbow bend throughout
- Don't go too deep - stop when you feel stretch
- Squeeze chest at top`,
  },
  {
    id: 'cable-flyes',
    name: 'Cable Flyes',
    muscles: { primary: ['chest'], secondary: [] },
    type: 'isolation',
    equipment: 'cable',
    alternatives: ['dumbbell-flyes', 'pec-deck'],
    description: `## How to Perform
1. Set cables at shoulder height or higher
2. Step forward, arms extended to sides
3. Bring hands together in front of chest
4. Control the return

## Cues
- Constant tension throughout movement
- Can target different areas by adjusting cable height
- High-to-low for lower chest, low-to-high for upper`,
  },
  {
    id: 'pec-deck',
    name: 'Pec Deck Machine',
    muscles: { primary: ['chest'], secondary: [] },
    type: 'isolation',
    equipment: 'machine',
    alternatives: ['cable-flyes', 'dumbbell-flyes'],
    description: `## How to Perform
1. Adjust seat so handles are at chest level
2. Place forearms on pads or grip handles
3. Bring arms together in front
4. Control the return

## Cues
- Keep back flat against pad
- Focus on squeezing chest`,
  },
  {
    id: 'machine-chest-press',
    name: 'Machine Chest Press',
    muscles: { primary: ['chest'], secondary: ['triceps', 'shoulders'] },
    type: 'compound',
    equipment: 'machine',
    alternatives: ['barbell-bench-press', 'dumbbell-bench-press'],
    description: `## How to Perform
1. Adjust seat so handles are at chest level
2. Press handles forward to full extension
3. Return with control

## Cues
- Good for beginners or burnout sets
- Safer without a spotter`,
  },
  {
    id: 'push-ups',
    name: 'Push-Ups',
    muscles: { primary: ['chest'], secondary: ['triceps', 'shoulders', 'abs'] },
    type: 'compound',
    equipment: 'bodyweight',
    alternatives: ['barbell-bench-press', 'dumbbell-bench-press'],
    description: `## How to Perform
1. Start in plank position, hands shoulder-width apart
2. Lower chest to ground, keeping body straight
3. Push back up to start

## Cues
- Keep core tight throughout
- Elbows at 45 degree angle
- Full range of motion`,
  },
  {
    id: 'dips',
    name: 'Dips',
    muscles: { primary: ['chest', 'triceps'], secondary: ['shoulders'] },
    type: 'compound',
    equipment: 'bodyweight',
    alternatives: ['decline-bench-press', 'cable-flyes'],
    description: `## How to Perform
1. Grip parallel bars, arms straight
2. Lean forward slightly for chest emphasis
3. Lower until upper arms are parallel to ground
4. Press back up

## Cues
- Lean forward = more chest, upright = more triceps
- Don't go too deep if shoulder issues
- Add weight with belt when bodyweight is easy`,
  },

  // ============ BACK ============
  {
    id: 'barbell-row',
    name: 'Barbell Row',
    muscles: { primary: ['back', 'lats'], secondary: ['biceps', 'traps'] },
    type: 'compound',
    equipment: 'barbell',
    alternatives: ['dumbbell-row', 'cable-row'],
    description: `## How to Perform
1. Hinge at hips, back flat, grip bar outside knees
2. Pull bar to lower chest/upper abs
3. Squeeze shoulder blades together at top
4. Lower with control

## Cues
- Keep back flat, don't round
- Pull elbows back, not up
- Control the negative`,
  },
  {
    id: 'dumbbell-row',
    name: 'Dumbbell Row',
    muscles: { primary: ['back', 'lats'], secondary: ['biceps'] },
    type: 'compound',
    equipment: 'dumbbell',
    alternatives: ['barbell-row', 'cable-row'],
    description: `## How to Perform
1. Place knee and hand on bench, other foot on floor
2. Row dumbbell to hip, keeping elbow close
3. Lower with control

## Cues
- Keep back flat and parallel to ground
- Don't rotate torso
- Full stretch at bottom`,
  },
  {
    id: 'pull-ups',
    name: 'Pull-Ups',
    muscles: { primary: ['lats', 'back'], secondary: ['biceps'] },
    type: 'compound',
    equipment: 'bodyweight',
    alternatives: ['lat-pulldown', 'assisted-pull-ups'],
    description: `## How to Perform
1. Grip bar with palms facing away, slightly wider than shoulders
2. Hang with arms extended
3. Pull up until chin clears bar
4. Lower with control

## Cues
- Initiate with lats, not biceps
- Avoid kipping or swinging
- Full dead hang at bottom`,
  },
  {
    id: 'chin-ups',
    name: 'Chin-Ups',
    muscles: { primary: ['lats', 'biceps'], secondary: ['back'] },
    type: 'compound',
    equipment: 'bodyweight',
    alternatives: ['pull-ups', 'lat-pulldown'],
    description: `## How to Perform
1. Grip bar with palms facing you, shoulder width
2. Pull up until chin clears bar
3. Lower with control

## Cues
- More bicep involvement than pull-ups
- Great for building pulling strength`,
  },
  {
    id: 'lat-pulldown',
    name: 'Lat Pulldown',
    muscles: { primary: ['lats'], secondary: ['biceps', 'back'] },
    type: 'compound',
    equipment: 'cable',
    alternatives: ['pull-ups', 'chin-ups'],
    description: `## How to Perform
1. Grip bar wide, sit with thighs secured
2. Pull bar to upper chest
3. Squeeze lats at bottom
4. Control the return

## Cues
- Don't lean back excessively
- Pull elbows down and back
- Feel the stretch at top`,
  },
  {
    id: 'cable-row',
    name: 'Seated Cable Row',
    muscles: { primary: ['back', 'lats'], secondary: ['biceps'] },
    type: 'compound',
    equipment: 'cable',
    alternatives: ['barbell-row', 'dumbbell-row'],
    description: `## How to Perform
1. Sit with feet on platform, knees slightly bent
2. Pull handle to lower chest
3. Squeeze shoulder blades together
4. Return with control

## Cues
- Keep back straight, don't round
- Full stretch forward, full squeeze back`,
  },
  {
    id: 't-bar-row',
    name: 'T-Bar Row',
    muscles: { primary: ['back'], secondary: ['biceps', 'lats'] },
    type: 'compound',
    equipment: 'barbell',
    alternatives: ['barbell-row', 'dumbbell-row'],
    description: `## How to Perform
1. Straddle the bar, grip handle
2. Pull to chest, squeezing back
3. Lower with control

## Cues
- Great for building thickness
- Keep chest supported if using machine version`,
  },
  {
    id: 'deadlift',
    name: 'Conventional Deadlift',
    muscles: { primary: ['back', 'hamstrings', 'glutes'], secondary: ['traps', 'forearms'] },
    type: 'compound',
    equipment: 'barbell',
    alternatives: ['romanian-deadlift', 'sumo-deadlift'],
    description: `## How to Perform
1. Stand with feet hip-width, bar over mid-foot
2. Hinge and grip bar just outside legs
3. Brace core, flatten back
4. Drive through floor, extending hips and knees together
5. Lock out at top, then reverse

## Cues
- Bar stays close to body
- Don't round lower back
- Push the floor away`,
  },
  {
    id: 'romanian-deadlift',
    name: 'Romanian Deadlift',
    muscles: { primary: ['hamstrings', 'glutes'], secondary: ['back'] },
    type: 'compound',
    equipment: 'barbell',
    alternatives: ['deadlift', 'dumbbell-rdl'],
    description: `## How to Perform
1. Start standing with bar at hips
2. Push hips back, lowering bar along legs
3. Keep slight knee bend, back flat
4. Feel hamstring stretch, then drive hips forward

## Cues
- Hip hinge, not a squat
- Bar stays close to legs
- Don't go lower than mid-shin`,
  },
  {
    id: 'face-pulls',
    name: 'Face Pulls',
    muscles: { primary: ['shoulders', 'traps'], secondary: ['back'] },
    type: 'isolation',
    equipment: 'cable',
    alternatives: ['rear-delt-flyes', 'band-pull-aparts'],
    description: `## How to Perform
1. Set cable at face height with rope attachment
2. Pull rope to face, separating hands
3. Externally rotate shoulders at end
4. Return with control

## Cues
- Great for posture and shoulder health
- Pull to ears, not chest
- Squeeze rear delts`,
  },
  {
    id: 'rack-pulls',
    name: 'Rack Pulls',
    muscles: { primary: ['back', 'traps'], secondary: ['glutes', 'hamstrings'] },
    type: 'compound',
    equipment: 'barbell',
    alternatives: ['deadlift', 'block-pulls'],
    description: `## How to Perform
1. Set bar in rack at knee height or just below
2. Grip and pull to lockout
3. Lower with control

## Cues
- Great for upper back and lockout strength
- Can handle heavier weights than full deadlift`,
  },

  // ============ SHOULDERS ============
  {
    id: 'overhead-press',
    name: 'Overhead Press',
    muscles: { primary: ['shoulders'], secondary: ['triceps', 'traps'] },
    type: 'compound',
    equipment: 'barbell',
    alternatives: ['dumbbell-shoulder-press', 'machine-shoulder-press'],
    description: `## How to Perform
1. Grip bar at shoulder width, bar resting on front delts
2. Brace core, press bar overhead
3. Lock out with bar over mid-foot
4. Lower to shoulders

## Cues
- Keep core tight, don't lean back excessively
- Move head back slightly as bar passes
- Full lockout overhead`,
  },
  {
    id: 'dumbbell-shoulder-press',
    name: 'Dumbbell Shoulder Press',
    muscles: { primary: ['shoulders'], secondary: ['triceps'] },
    type: 'compound',
    equipment: 'dumbbell',
    alternatives: ['overhead-press', 'machine-shoulder-press'],
    description: `## How to Perform
1. Sit or stand with dumbbells at shoulder level
2. Press up, bringing dumbbells together at top
3. Lower to shoulders

## Cues
- Allows more natural movement path
- Good for addressing imbalances`,
  },
  {
    id: 'arnold-press',
    name: 'Arnold Press',
    muscles: { primary: ['shoulders'], secondary: ['triceps'] },
    type: 'compound',
    equipment: 'dumbbell',
    alternatives: ['dumbbell-shoulder-press'],
    description: `## How to Perform
1. Start with dumbbells at chest, palms facing you
2. Press up while rotating palms to face forward
3. Reverse on the way down

## Cues
- Hits all three delt heads
- Use lighter weight than regular press`,
  },
  {
    id: 'lateral-raises',
    name: 'Lateral Raises',
    muscles: { primary: ['shoulders'], secondary: [] },
    type: 'isolation',
    equipment: 'dumbbell',
    alternatives: ['cable-lateral-raises', 'machine-lateral-raises'],
    description: `## How to Perform
1. Stand with dumbbells at sides
2. Raise arms out to sides until parallel to ground
3. Lower with control

## Cues
- Slight bend in elbows
- Lead with elbows, not hands
- Don't swing or use momentum`,
  },
  {
    id: 'cable-lateral-raises',
    name: 'Cable Lateral Raises',
    muscles: { primary: ['shoulders'], secondary: [] },
    type: 'isolation',
    equipment: 'cable',
    alternatives: ['lateral-raises'],
    description: `## How to Perform
1. Set cable at lowest setting
2. Stand sideways to machine
3. Raise arm out to side
4. Lower with control

## Cues
- Constant tension throughout
- Can do one arm at a time for focus`,
  },
  {
    id: 'front-raises',
    name: 'Front Raises',
    muscles: { primary: ['shoulders'], secondary: [] },
    type: 'isolation',
    equipment: 'dumbbell',
    alternatives: ['cable-front-raises', 'plate-front-raises'],
    description: `## How to Perform
1. Stand with dumbbells in front of thighs
2. Raise one or both arms to shoulder height
3. Lower with control

## Cues
- Keep arms straight or slight bend
- Don't swing
- Front delts often get enough work from pressing`,
  },
  {
    id: 'rear-delt-flyes',
    name: 'Rear Delt Flyes',
    muscles: { primary: ['shoulders'], secondary: ['traps'] },
    type: 'isolation',
    equipment: 'dumbbell',
    alternatives: ['face-pulls', 'reverse-pec-deck'],
    description: `## How to Perform
1. Bend over with flat back, dumbbells hanging
2. Raise arms out to sides, squeezing rear delts
3. Lower with control

## Cues
- Keep slight elbow bend
- Don't use too much weight
- Feel it in back of shoulders`,
  },
  {
    id: 'upright-rows',
    name: 'Upright Rows',
    muscles: { primary: ['shoulders', 'traps'], secondary: [] },
    type: 'compound',
    equipment: 'barbell',
    alternatives: ['cable-upright-rows', 'dumbbell-upright-rows'],
    description: `## How to Perform
1. Grip bar with hands close together
2. Pull bar up along body to chin level
3. Lead with elbows
4. Lower with control

## Cues
- Can cause shoulder impingement - use wider grip if issues
- Don't pull too high if uncomfortable`,
  },
  {
    id: 'shrugs',
    name: 'Barbell Shrugs',
    muscles: { primary: ['traps'], secondary: [] },
    type: 'isolation',
    equipment: 'barbell',
    alternatives: ['dumbbell-shrugs', 'machine-shrugs'],
    description: `## How to Perform
1. Hold bar at arms length
2. Shrug shoulders straight up toward ears
3. Hold briefly at top
4. Lower with control

## Cues
- Don't roll shoulders
- Straight up and down motion
- Can use straps for heavy weight`,
  },

  // ============ BICEPS ============
  {
    id: 'barbell-curl',
    name: 'Barbell Curl',
    muscles: { primary: ['biceps'], secondary: ['forearms'] },
    type: 'isolation',
    equipment: 'barbell',
    alternatives: ['dumbbell-curl', 'ez-bar-curl'],
    description: `## How to Perform
1. Stand with bar at arms length, palms up
2. Curl bar to shoulders, keeping elbows stationary
3. Squeeze biceps at top
4. Lower with control

## Cues
- Don't swing or use momentum
- Keep elbows at sides
- Full range of motion`,
  },
  {
    id: 'dumbbell-curl',
    name: 'Dumbbell Curl',
    muscles: { primary: ['biceps'], secondary: ['forearms'] },
    type: 'isolation',
    equipment: 'dumbbell',
    alternatives: ['barbell-curl', 'cable-curl'],
    description: `## How to Perform
1. Stand or sit with dumbbells at sides
2. Curl up, can supinate (rotate) at top
3. Lower with control

## Cues
- Can alternate arms or do both together
- Supination increases bicep activation`,
  },
  {
    id: 'hammer-curl',
    name: 'Hammer Curl',
    muscles: { primary: ['biceps', 'forearms'], secondary: [] },
    type: 'isolation',
    equipment: 'dumbbell',
    alternatives: ['cross-body-hammer-curl', 'rope-hammer-curl'],
    description: `## How to Perform
1. Hold dumbbells with neutral grip (palms facing each other)
2. Curl up keeping neutral grip
3. Lower with control

## Cues
- Hits brachialis and brachioradialis more
- Good for forearm development`,
  },
  {
    id: 'preacher-curl',
    name: 'Preacher Curl',
    muscles: { primary: ['biceps'], secondary: [] },
    type: 'isolation',
    equipment: 'ez-bar',
    alternatives: ['dumbbell-preacher-curl', 'machine-preacher-curl'],
    description: `## How to Perform
1. Sit at preacher bench, arms over pad
2. Curl weight up, squeezing biceps
3. Lower with control to full extension

## Cues
- Eliminates momentum
- Great stretch at bottom
- Don't go too heavy - vulnerable position`,
  },
  {
    id: 'incline-dumbbell-curl',
    name: 'Incline Dumbbell Curl',
    muscles: { primary: ['biceps'], secondary: [] },
    type: 'isolation',
    equipment: 'dumbbell',
    alternatives: ['dumbbell-curl', 'preacher-curl'],
    description: `## How to Perform
1. Sit on incline bench (45-60 degrees)
2. Let arms hang straight down
3. Curl up without moving upper arms
4. Lower to full stretch

## Cues
- Great stretch on long head of biceps
- Don't swing or use momentum`,
  },
  {
    id: 'concentration-curl',
    name: 'Concentration Curl',
    muscles: { primary: ['biceps'], secondary: [] },
    type: 'isolation',
    equipment: 'dumbbell',
    alternatives: ['preacher-curl', 'cable-curl'],
    description: `## How to Perform
1. Sit, elbow braced against inner thigh
2. Curl dumbbell to shoulder
3. Squeeze at top
4. Lower with control

## Cues
- Isolates bicep completely
- Great for mind-muscle connection`,
  },
  {
    id: 'cable-curl',
    name: 'Cable Curl',
    muscles: { primary: ['biceps'], secondary: [] },
    type: 'isolation',
    equipment: 'cable',
    alternatives: ['barbell-curl', 'dumbbell-curl'],
    description: `## How to Perform
1. Set cable at lowest position
2. Curl handle up to shoulders
3. Lower with control

## Cues
- Constant tension throughout
- Good for drop sets`,
  },

  // ============ TRICEPS ============
  {
    id: 'tricep-pushdown',
    name: 'Tricep Pushdown',
    muscles: { primary: ['triceps'], secondary: [] },
    type: 'isolation',
    equipment: 'cable',
    alternatives: ['rope-pushdown', 'overhead-tricep-extension'],
    description: `## How to Perform
1. Set cable high, grip bar or rope
2. Keep elbows at sides
3. Push down until arms are straight
4. Return with control

## Cues
- Don't let elbows flare
- Squeeze triceps at bottom
- Can use different attachments`,
  },
  {
    id: 'rope-pushdown',
    name: 'Rope Pushdown',
    muscles: { primary: ['triceps'], secondary: [] },
    type: 'isolation',
    equipment: 'cable',
    alternatives: ['tricep-pushdown', 'overhead-tricep-extension'],
    description: `## How to Perform
1. Grip rope attachment at cable
2. Push down and spread rope at bottom
3. Squeeze triceps
4. Return with control

## Cues
- Spreading the rope increases contraction
- Keep elbows pinned`,
  },
  {
    id: 'skull-crushers',
    name: 'Skull Crushers',
    muscles: { primary: ['triceps'], secondary: [] },
    type: 'isolation',
    equipment: 'ez-bar',
    alternatives: ['overhead-tricep-extension', 'tricep-pushdown'],
    description: `## How to Perform
1. Lie on bench, hold bar above chest
2. Lower bar to forehead by bending elbows
3. Extend back up

## Cues
- Keep upper arms stationary
- Can lower to behind head for more stretch
- Use EZ bar for wrist comfort`,
  },
  {
    id: 'overhead-tricep-extension',
    name: 'Overhead Tricep Extension',
    muscles: { primary: ['triceps'], secondary: [] },
    type: 'isolation',
    equipment: 'dumbbell',
    alternatives: ['skull-crushers', 'tricep-pushdown'],
    description: `## How to Perform
1. Hold dumbbell overhead with both hands
2. Lower behind head by bending elbows
3. Extend back up

## Cues
- Keep elbows pointing forward
- Feel the stretch at bottom
- Can do with cable or EZ bar`,
  },
  {
    id: 'close-grip-bench-press',
    name: 'Close Grip Bench Press',
    muscles: { primary: ['triceps'], secondary: ['chest', 'shoulders'] },
    type: 'compound',
    equipment: 'barbell',
    alternatives: ['dips', 'skull-crushers'],
    description: `## How to Perform
1. Grip bar at shoulder width or narrower
2. Lower to lower chest
3. Press up, focusing on triceps

## Cues
- Great compound tricep movement
- Keep elbows closer to body than regular bench`,
  },
  {
    id: 'tricep-kickbacks',
    name: 'Tricep Kickbacks',
    muscles: { primary: ['triceps'], secondary: [] },
    type: 'isolation',
    equipment: 'dumbbell',
    alternatives: ['tricep-pushdown', 'rope-pushdown'],
    description: `## How to Perform
1. Bend over, upper arm parallel to ground
2. Extend forearm back until arm is straight
3. Squeeze tricep
4. Return with control

## Cues
- Keep upper arm stationary
- Don't swing the weight
- Light weight, high reps works well`,
  },

  // ============ LEGS - QUADS ============
  {
    id: 'barbell-squat',
    name: 'Barbell Back Squat',
    muscles: { primary: ['quads', 'glutes'], secondary: ['hamstrings', 'abs'] },
    type: 'compound',
    equipment: 'barbell',
    alternatives: ['front-squat', 'leg-press', 'goblet-squat'],
    description: `## How to Perform
1. Bar on upper back, feet shoulder width or wider
2. Brace core, push hips back
3. Descend until thighs are parallel or below
4. Drive up through heels

## Cues
- Knees track over toes
- Keep chest up
- Don't let knees cave in`,
  },
  {
    id: 'front-squat',
    name: 'Front Squat',
    muscles: { primary: ['quads'], secondary: ['glutes', 'abs'] },
    type: 'compound',
    equipment: 'barbell',
    alternatives: ['barbell-squat', 'leg-press'],
    description: `## How to Perform
1. Bar on front delts, elbows high
2. Squat down keeping torso upright
3. Drive up through whole foot

## Cues
- More quad dominant than back squat
- Requires good mobility
- Keep elbows up throughout`,
  },
  {
    id: 'leg-press',
    name: 'Leg Press',
    muscles: { primary: ['quads', 'glutes'], secondary: ['hamstrings'] },
    type: 'compound',
    equipment: 'machine',
    alternatives: ['barbell-squat', 'hack-squat'],
    description: `## How to Perform
1. Sit in machine, feet shoulder width on platform
2. Lower weight by bending knees
3. Press back up without locking knees

## Cues
- Foot placement changes emphasis
- High and wide = more glutes/hamstrings
- Low and narrow = more quads`,
  },
  {
    id: 'hack-squat',
    name: 'Hack Squat',
    muscles: { primary: ['quads'], secondary: ['glutes'] },
    type: 'compound',
    equipment: 'machine',
    alternatives: ['leg-press', 'barbell-squat'],
    description: `## How to Perform
1. Position shoulders under pads, feet on platform
2. Lower by bending knees
3. Press back up

## Cues
- Very quad dominant
- Safer than free weight squats
- Good for high volume`,
  },
  {
    id: 'leg-extension',
    name: 'Leg Extension',
    muscles: { primary: ['quads'], secondary: [] },
    type: 'isolation',
    equipment: 'machine',
    alternatives: ['sissy-squat'],
    description: `## How to Perform
1. Sit in machine, ankles behind pad
2. Extend legs until straight
3. Squeeze quads at top
4. Lower with control

## Cues
- Great for quad isolation
- Don't go too heavy - hard on knees
- Good for pre-exhaust or burnout`,
  },
  {
    id: 'lunges',
    name: 'Lunges',
    muscles: { primary: ['quads', 'glutes'], secondary: ['hamstrings'] },
    type: 'compound',
    equipment: 'dumbbell',
    alternatives: ['walking-lunges', 'split-squat', 'bulgarian-split-squat'],
    description: `## How to Perform
1. Stand with dumbbells at sides
2. Step forward, lowering back knee toward ground
3. Push back to start
4. Alternate legs

## Cues
- Keep torso upright
- Front knee tracks over toes
- Drive through front heel`,
  },
  {
    id: 'bulgarian-split-squat',
    name: 'Bulgarian Split Squat',
    muscles: { primary: ['quads', 'glutes'], secondary: ['hamstrings'] },
    type: 'compound',
    equipment: 'dumbbell',
    alternatives: ['lunges', 'split-squat'],
    description: `## How to Perform
1. Rear foot elevated on bench
2. Lower until front thigh is parallel
3. Drive up through front leg

## Cues
- Brutal but effective
- Great for addressing imbalances
- Start with bodyweight`,
  },
  {
    id: 'goblet-squat',
    name: 'Goblet Squat',
    muscles: { primary: ['quads', 'glutes'], secondary: ['abs'] },
    type: 'compound',
    equipment: 'dumbbell',
    alternatives: ['barbell-squat', 'leg-press'],
    description: `## How to Perform
1. Hold dumbbell at chest level
2. Squat down between knees
3. Drive back up

## Cues
- Great for learning squat pattern
- Easier to stay upright
- Good for mobility work`,
  },

  // ============ LEGS - HAMSTRINGS ============
  {
    id: 'leg-curl',
    name: 'Lying Leg Curl',
    muscles: { primary: ['hamstrings'], secondary: [] },
    type: 'isolation',
    equipment: 'machine',
    alternatives: ['seated-leg-curl', 'nordic-curl'],
    description: `## How to Perform
1. Lie face down, ankles under pad
2. Curl heels toward glutes
3. Squeeze hamstrings at top
4. Lower with control

## Cues
- Don't lift hips off pad
- Control the negative`,
  },
  {
    id: 'seated-leg-curl',
    name: 'Seated Leg Curl',
    muscles: { primary: ['hamstrings'], secondary: [] },
    type: 'isolation',
    equipment: 'machine',
    alternatives: ['leg-curl', 'nordic-curl'],
    description: `## How to Perform
1. Sit in machine, legs extended
2. Curl heels under seat
3. Squeeze hamstrings
4. Return with control

## Cues
- Keep back against pad
- Some prefer this to lying version`,
  },
  {
    id: 'stiff-leg-deadlift',
    name: 'Stiff Leg Deadlift',
    muscles: { primary: ['hamstrings'], secondary: ['glutes', 'back'] },
    type: 'compound',
    equipment: 'barbell',
    alternatives: ['romanian-deadlift', 'good-mornings'],
    description: `## How to Perform
1. Stand with bar at thighs, legs nearly straight
2. Lower bar by hinging at hips
3. Feel hamstring stretch
4. Return to standing

## Cues
- Less knee bend than RDL
- Greater hamstring stretch
- Don't round lower back`,
  },
  {
    id: 'good-mornings',
    name: 'Good Mornings',
    muscles: { primary: ['hamstrings', 'back'], secondary: ['glutes'] },
    type: 'compound',
    equipment: 'barbell',
    alternatives: ['romanian-deadlift', 'stiff-leg-deadlift'],
    description: `## How to Perform
1. Bar on upper back like squat
2. Push hips back, bending forward
3. Feel hamstring stretch
4. Return to standing

## Cues
- Keep back flat
- Slight knee bend
- Start light`,
  },

  // ============ LEGS - GLUTES ============
  {
    id: 'hip-thrust',
    name: 'Hip Thrust',
    muscles: { primary: ['glutes'], secondary: ['hamstrings'] },
    type: 'compound',
    equipment: 'barbell',
    alternatives: ['glute-bridge', 'cable-pull-through'],
    description: `## How to Perform
1. Upper back on bench, bar over hips
2. Drive hips up, squeezing glutes
3. Hold at top briefly
4. Lower with control

## Cues
- Posterior pelvic tilt at top
- Don't hyperextend lower back
- Great glute builder`,
  },
  {
    id: 'glute-bridge',
    name: 'Glute Bridge',
    muscles: { primary: ['glutes'], secondary: ['hamstrings'] },
    type: 'isolation',
    equipment: 'bodyweight',
    alternatives: ['hip-thrust'],
    description: `## How to Perform
1. Lie on back, knees bent, feet flat
2. Drive hips up, squeezing glutes
3. Hold at top
4. Lower with control

## Cues
- Can add weight on hips
- Good for activation or high reps`,
  },
  {
    id: 'cable-pull-through',
    name: 'Cable Pull Through',
    muscles: { primary: ['glutes'], secondary: ['hamstrings'] },
    type: 'compound',
    equipment: 'cable',
    alternatives: ['hip-thrust', 'romanian-deadlift'],
    description: `## How to Perform
1. Face away from low cable, rope between legs
2. Hinge forward, feeling stretch in hamstrings
3. Drive hips forward, squeezing glutes
4. Return with control

## Cues
- Keep arms straight
- Hip hinge movement
- Great for learning hip hinge`,
  },
  {
    id: 'sumo-deadlift',
    name: 'Sumo Deadlift',
    muscles: { primary: ['glutes', 'quads'], secondary: ['hamstrings', 'back'] },
    type: 'compound',
    equipment: 'barbell',
    alternatives: ['deadlift', 'trap-bar-deadlift'],
    description: `## How to Perform
1. Wide stance, toes pointed out
2. Grip bar between legs
3. Drive through floor, keeping chest up
4. Lock out at top

## Cues
- More quad and hip involvement
- Shorter range of motion
- Push knees out`,
  },

  // ============ LEGS - CALVES ============
  {
    id: 'standing-calf-raise',
    name: 'Standing Calf Raise',
    muscles: { primary: ['calves'], secondary: [] },
    type: 'isolation',
    equipment: 'machine',
    alternatives: ['seated-calf-raise', 'donkey-calf-raise'],
    description: `## How to Perform
1. Shoulders under pads, balls of feet on platform
2. Lower heels for full stretch
3. Rise up on toes
4. Squeeze at top

## Cues
- Full range of motion is key
- Pause at top and bottom
- Don't bounce`,
  },
  {
    id: 'seated-calf-raise',
    name: 'Seated Calf Raise',
    muscles: { primary: ['calves'], secondary: [] },
    type: 'isolation',
    equipment: 'machine',
    alternatives: ['standing-calf-raise'],
    description: `## How to Perform
1. Sit with pad on lower thighs
2. Lower heels for stretch
3. Press up on toes
4. Squeeze at top

## Cues
- Targets soleus more (deeper calf muscle)
- Important for complete calf development`,
  },

  // ============ ABS ============
  {
    id: 'cable-crunch',
    name: 'Cable Crunch',
    muscles: { primary: ['abs'], secondary: [] },
    type: 'isolation',
    equipment: 'cable',
    alternatives: ['hanging-leg-raise', 'decline-crunch'],
    description: `## How to Perform
1. Kneel facing cable, rope behind head
2. Crunch down, bringing elbows to knees
3. Squeeze abs at bottom
4. Return with control

## Cues
- Don't just bend at hips
- Round the spine to contract abs
- Can add progressive overload`,
  },
  {
    id: 'hanging-leg-raise',
    name: 'Hanging Leg Raise',
    muscles: { primary: ['abs'], secondary: [] },
    type: 'isolation',
    equipment: 'bodyweight',
    alternatives: ['cable-crunch', 'lying-leg-raise'],
    description: `## How to Perform
1. Hang from bar with arms straight
2. Raise legs until parallel or higher
3. Lower with control

## Cues
- Don't swing
- Curl pelvis up for more ab activation
- Can bend knees if straight is too hard`,
  },
  {
    id: 'plank',
    name: 'Plank',
    muscles: { primary: ['abs'], secondary: ['shoulders'] },
    type: 'isolation',
    equipment: 'bodyweight',
    alternatives: ['dead-bug', 'ab-wheel'],
    description: `## How to Perform
1. Forearms and toes on ground
2. Keep body in straight line
3. Hold position

## Cues
- Don't let hips sag or pike up
- Squeeze glutes and brace abs
- Breathe normally`,
  },
  {
    id: 'ab-wheel',
    name: 'Ab Wheel Rollout',
    muscles: { primary: ['abs'], secondary: ['shoulders', 'lats'] },
    type: 'compound',
    equipment: 'other',
    alternatives: ['plank', 'cable-crunch'],
    description: `## How to Perform
1. Kneel holding ab wheel
2. Roll forward, extending body
3. Pull back using abs

## Cues
- Keep core tight throughout
- Don't let lower back arch
- Start with partial range`,
  },

  // ============ ADDITIONAL COMPOUNDS ============
  {
    id: 'trap-bar-deadlift',
    name: 'Trap Bar Deadlift',
    muscles: { primary: ['quads', 'glutes', 'back'], secondary: ['hamstrings', 'traps'] },
    type: 'compound',
    equipment: 'other',
    alternatives: ['deadlift', 'sumo-deadlift'],
    description: `## How to Perform
1. Stand inside trap bar, feet hip width
2. Grip handles, brace core
3. Drive through floor to standing
4. Lower with control

## Cues
- More quad involvement than conventional
- Easier on lower back
- Great for beginners`,
  },
  {
    id: 'farmers-walk',
    name: "Farmer's Walk",
    muscles: { primary: ['traps', 'forearms'], secondary: ['abs', 'glutes'] },
    type: 'compound',
    equipment: 'dumbbell',
    alternatives: ['suitcase-carry'],
    description: `## How to Perform
1. Pick up heavy dumbbells/implements
2. Walk with tall posture
3. Keep core braced

## Cues
- Great for grip and conditioning
- Walk in straight line
- Don't let weights swing`,
  },
  {
    id: 'landmine-press',
    name: 'Landmine Press',
    muscles: { primary: ['shoulders', 'chest'], secondary: ['triceps'] },
    type: 'compound',
    equipment: 'barbell',
    alternatives: ['overhead-press', 'dumbbell-shoulder-press'],
    description: `## How to Perform
1. Stand at end of barbell in landmine
2. Press up and forward at angle
3. Lower with control

## Cues
- Easier on shoulders than overhead press
- Can do single arm or both`,
  },
  {
    id: 'pendlay-row',
    name: 'Pendlay Row',
    muscles: { primary: ['back', 'lats'], secondary: ['biceps'] },
    type: 'compound',
    equipment: 'barbell',
    alternatives: ['barbell-row', 'dumbbell-row'],
    description: `## How to Perform
1. Bar on floor, bend over parallel to ground
2. Explosively row to chest
3. Return bar to floor each rep

## Cues
- More explosive than regular row
- Full reset each rep
- Great for power`,
  },
  {
    id: 'meadows-row',
    name: 'Meadows Row',
    muscles: { primary: ['lats'], secondary: ['biceps', 'back'] },
    type: 'compound',
    equipment: 'barbell',
    alternatives: ['dumbbell-row', 't-bar-row'],
    description: `## How to Perform
1. Barbell in landmine, stand perpendicular
2. Staggered stance, grip end of bar
3. Row to hip, elbow pulling back

## Cues
- Great lat stretch
- Created by John Meadows
- Unique angle hits lats differently`,
  },
];
