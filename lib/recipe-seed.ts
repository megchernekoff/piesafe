export interface SeedRecipe {
  title: string; description: string; category: string; emoji: string; color: string
  prep_time: number; cook_time: number; servings: number
  ingredients: string[]; instructions: string[]; tags: string[]; contains: string[]
}

const V = '#4a7a4f'  // vegan
const G = '#5a6a3f'  // vegetarian
const C = '#c8911a'  // chicken
const F = '#3a7080'  // fish
const P = '#8a6840'  // pasta
const B = '#7a3a3a'  // beef
const K = '#9a5060'  // pork
const L = '#6a5a8a'  // other

export const STARTER_RECIPE_SEED: SeedRecipe[] = [
  // ── VEGAN (25) ─────────────────────────────────────────────────────────────
  { title:'Chickpea Coconut Curry', description:'Creamy chickpea curry simmered in coconut milk with warming spices — ready in 30 minutes.', category:'Vegan', emoji:'🌿', color:V, prep_time:10, cook_time:25, servings:4, contains:[], tags:['vegan','curry','quick','gf'],
    ingredients:['2 cans chickpeas, drained','1 can (400ml) coconut milk','1 can diced tomatoes','1 onion, diced','3 garlic cloves, minced','1 tbsp curry powder','1 tsp ground ginger','Salt, fresh coriander, rice to serve'],
    instructions:['Sauté onion in oil 5 minutes. Add garlic, curry powder, ginger — cook 1 minute.','Add chickpeas, tomatoes, coconut milk. Stir to combine.','Simmer 20 minutes until sauce thickens. Season well.','Serve over rice, topped with fresh coriander.'] },

  { title:'Red Lentil Dal', description:'A deeply comforting lentil stew tempered with mustard seeds, cumin, and ghee — vegan with oil instead.', category:'Vegan', emoji:'🌿', color:V, prep_time:10, cook_time:30, servings:4, contains:[], tags:['vegan','lentil','indian','gf'],
    ingredients:['300g red lentils','1 can diced tomatoes','1 onion, diced','4 garlic cloves','1 tsp turmeric','1 tsp cumin','1 tsp mustard seeds','2 tbsp vegetable oil, salt, lemon juice'],
    instructions:['Rinse lentils. Simmer in 800ml water with turmeric and salt 20 minutes until soft.','Heat oil in a pan, fry mustard seeds until they pop. Add onion, garlic, cumin — cook 8 minutes.','Add tomatoes, cook 5 minutes. Stir into lentils.','Finish with a squeeze of lemon. Serve with rice or naan.'] },

  { title:'Black Bean Tacos', description:'Smoky black beans with pickled cabbage and avocado crema in charred corn tortillas.', category:'Vegan', emoji:'🌿', color:V, prep_time:15, cook_time:10, servings:4, contains:[], tags:['vegan','tacos','mexican','gf'],
    ingredients:['2 cans black beans, drained','1 tsp smoked paprika','1 tsp cumin','8 corn tortillas','1 avocado','Juice of 1 lime','½ red cabbage, shredded','Salt, coriander'],
    instructions:['Warm beans in a pan with paprika, cumin, salt and a splash of water — simmer 8 minutes.','Mash avocado with lime juice and a pinch of salt into rough crema.','Char tortillas directly over flame or in a dry pan.','Assemble with beans, pickled cabbage, avocado crema, coriander.'] },

  { title:'Thai Basil Tofu Stir-Fry', description:'Crispy tofu, Thai basil, and chilli in a sweet-savory sauce — 20 minutes flat.', category:'Vegan', emoji:'🌿', color:V, prep_time:10, cook_time:15, servings:4, contains:[], tags:['vegan','tofu','thai','quick','gf'],
    ingredients:['400g firm tofu, cubed and pressed dry','2 tbsp soy sauce','1 tbsp hoisin sauce','1 tsp sesame oil','4 garlic cloves, minced','2 red chillies, sliced','1 bunch Thai basil','2 tbsp vegetable oil, rice to serve'],
    instructions:['Fry tofu in oil over high heat until golden all over, 8 minutes. Remove.','Fry garlic and chilli 1 minute. Return tofu.','Add soy sauce, hoisin, sesame oil — toss over high heat 2 minutes.','Fold in Thai basil. Serve over rice.'] },

  { title:'Roasted Vegetable Buddha Bowl', description:'Caramelised roasted vegetables over grains with tahini dressing — endlessly customisable.', category:'Vegan', emoji:'🌿', color:V, prep_time:15, cook_time:30, servings:4, contains:[], tags:['vegan','bowl','roasted','gf'],
    ingredients:['1 sweet potato, cubed','2 courgettes, chunked','1 red pepper, chunked','1 can chickpeas, drained','3 tbsp olive oil','1 tsp cumin','200g cooked quinoa or farro','3 tbsp tahini, lemon, garlic for dressing'],
    instructions:['Toss vegetables and chickpeas with oil, cumin, salt. Roast at 220°C for 25 minutes.','Whisk tahini with lemon juice, garlic, and 3 tbsp water until smooth.','Build bowls: grain base, roasted veg on top.','Drizzle tahini dressing over everything.'] },

  { title:'White Bean & Tomato Stew', description:'Hearty tuscan-style white bean stew with rosemary and wilted greens.', category:'Vegan', emoji:'🌿', color:V, prep_time:10, cook_time:25, servings:4, contains:[], tags:['vegan','stew','italian','gf'],
    ingredients:['2 cans cannellini beans, drained','1 can crushed tomatoes','1 onion, diced','4 garlic cloves, minced','1 sprig rosemary','100g kale or spinach','2 tbsp olive oil','Salt, pepper, chilli flakes'],
    instructions:['Sauté onion in olive oil 5 minutes. Add garlic and rosemary, cook 2 minutes.','Add tomatoes and beans. Simmer 15 minutes, crushing some beans for body.','Add greens, stir until wilted. Season generously.','Drizzle with good olive oil. Serve with crusty bread.'] },

  { title:'Sweet Potato & Black Bean Bowl', description:'Spiced sweet potato, black beans, and mango salsa over rice — bright and filling.', category:'Vegan', emoji:'🌿', color:V, prep_time:15, cook_time:25, servings:4, contains:[], tags:['vegan','bowl','sweet potato','gf'],
    ingredients:['2 sweet potatoes, cubed','1 can black beans','1 tsp cumin','1 tsp chilli powder','1 mango, diced','½ red onion, finely diced','Juice of 2 limes','Rice, coriander to serve'],
    instructions:['Toss sweet potato with oil, cumin, chilli, salt. Roast at 220°C for 25 minutes.','Warm black beans in a pan with a pinch of cumin and salt.','Combine mango, red onion, lime juice for salsa.','Serve rice + sweet potato + beans, topped with mango salsa.'] },

  { title:'Mushroom & Lentil Bolognese', description:'A deeply savory plant-based ragu that rivals the original — slow-cooked until rich.', category:'Vegan', emoji:'🌿', color:V, prep_time:15, cook_time:45, servings:4, contains:['gluten'], tags:['vegan','pasta','lentil','mushroom'],
    ingredients:['300g mushrooms, finely chopped','150g green or brown lentils','1 onion, diced','2 carrots, diced','4 garlic cloves','1 can crushed tomatoes','1 tbsp tomato paste','200ml red wine (optional), pasta to serve'],
    instructions:['Sauté onion, carrot, garlic in oil 10 minutes until very soft.','Add mushrooms, cook until liquid evaporates — 8 minutes.','Add wine if using, reduce. Add tomatoes, tomato paste, lentils, 200ml water.','Simmer 35 minutes until lentils are soft. Toss with pasta.'] },

  { title:'Sesame Noodles with Edamame', description:'Cold sesame noodles tossed with edamame, cucumber, and scallions — 15-minute meal.', category:'Vegan', emoji:'🌿', color:V, prep_time:15, cook_time:10, servings:4, contains:['gluten','nuts'], tags:['vegan','noodles','asian','quick'],
    ingredients:['400g noodles','200g frozen edamame, thawed','1 cucumber, julienned','3 tbsp tahini or peanut butter','2 tbsp soy sauce','1 tbsp rice vinegar','1 tsp sesame oil','Sesame seeds, scallions to serve'],
    instructions:['Cook noodles per packet, rinse under cold water.','Whisk tahini, soy sauce, rice vinegar, sesame oil, 2 tbsp water.','Toss noodles with sauce, edamame, cucumber.','Top with sesame seeds and sliced scallions.'] },

  { title:'Smoky Black Bean Soup', description:'A thick, smoky black bean soup with chipotle and lime — canned-bean magic.', category:'Vegan', emoji:'🌿', color:V, prep_time:10, cook_time:25, servings:4, contains:[], tags:['vegan','soup','mexican','gf'],
    ingredients:['3 cans black beans, drained','1 onion, diced','4 garlic cloves','1 tsp cumin','1 chipotle chilli in adobo','1 can diced tomatoes','700ml vegetable stock','Juice of 1 lime, coriander to serve'],
    instructions:['Sauté onion in oil 5 minutes. Add garlic, cumin, chipotle — cook 2 minutes.','Add beans, tomatoes, stock. Simmer 20 minutes.','Blend half the soup for a creamy-chunky texture.','Finish with lime juice. Top with coriander and avocado.'] },

  { title:'Mango Avocado Rice Bowl', description:'Tropical brown rice bowl with mango, avocado, edamame, and a punchy ginger dressing.', category:'Vegan', emoji:'🌿', color:V, prep_time:15, cook_time:0, servings:4, contains:[], tags:['vegan','bowl','no-cook','gf'],
    ingredients:['300g cooked brown rice','1 mango, diced','2 avocados, sliced','150g edamame, shelled','1 cucumber, diced','2 tbsp soy sauce','1 tsp fresh ginger, grated','1 tsp sesame oil, sesame seeds'],
    instructions:['Whisk soy sauce, ginger, sesame oil, 1 tbsp rice vinegar.','Divide rice into bowls.','Top with mango, avocado, edamame, cucumber.','Drizzle dressing over and scatter sesame seeds.'] },

  { title:'Spiced Cauliflower (Gobi Aloo)', description:'Golden cauliflower and potatoes dry-fried with mustard seeds and turmeric — a classic Indian side that eats like a main.', category:'Vegan', emoji:'🌿', color:V, prep_time:10, cook_time:25, servings:4, contains:[], tags:['vegan','indian','gf','cauliflower'],
    ingredients:['1 large cauliflower, cut into florets','2 potatoes, cubed','1 tsp turmeric','1 tsp cumin seeds','1 tsp mustard seeds','2 garlic cloves','1 green chilli','3 tbsp vegetable oil, salt, coriander'],
    instructions:['Heat oil, add mustard and cumin seeds until they pop.','Add garlic, chilli, turmeric — 30 seconds. Add potatoes, cook 8 minutes.','Add cauliflower, stir well, cover and cook 12 minutes until tender.','Season, finish with fresh coriander. Serve with rice or roti.'] },

  { title:'Thai Green Curry with Tofu', description:'Fragrant green curry paste, creamy coconut milk, tofu, and vegetables — a weeknight classic.', category:'Vegan', emoji:'🌿', color:V, prep_time:10, cook_time:20, servings:4, contains:[], tags:['vegan','thai','curry','gf'],
    ingredients:['400g firm tofu, cubed','2 tbsp green curry paste (check vegan)','400ml coconut milk','200ml vegetable stock','2 courgettes, sliced','100g green beans','1 tbsp soy sauce','Fresh basil, rice to serve'],
    instructions:['Fry tofu until golden. Remove.','Fry curry paste in oil 1 minute until fragrant.','Add coconut milk and stock. Simmer 5 minutes.','Add vegetables and tofu. Cook 10 minutes. Season with soy sauce.'] },

  { title:'Mediterranean Quinoa Bowl', description:'Herb-tossed quinoa with roasted red pepper, olives, cucumber, and lemon.', category:'Vegan', emoji:'🌿', color:V, prep_time:15, cook_time:15, servings:4, contains:[], tags:['vegan','bowl','mediterranean','gf'],
    ingredients:['300g quinoa','2 roasted red peppers (jar), sliced','100g kalamata olives','1 cucumber, diced','1 small red onion, diced','Large handful parsley','Juice of 1 lemon','3 tbsp olive oil, salt'],
    instructions:['Cook quinoa per packet. Fluff and cool slightly.','Toss warm quinoa with olive oil, lemon juice, salt.','Add peppers, olives, cucumber, red onion, parsley.','Adjust seasoning. Serve warm or at room temperature.'] },

  { title:'Peanut Butter Noodles', description:'Silky peanut sauce noodles with crunchy vegetables — fast, satisfying, kids love it.', category:'Vegan', emoji:'🌿', color:V, prep_time:10, cook_time:10, servings:4, contains:['gluten','nuts'], tags:['vegan','noodles','quick','peanut'],
    ingredients:['400g noodles','3 tbsp peanut butter','2 tbsp soy sauce','1 tbsp rice vinegar','1 tsp sesame oil','1 tsp sriracha','1 red pepper, julienned','2 scallions, sliced'],
    instructions:['Cook noodles. Whisk peanut butter, soy sauce, vinegar, sesame oil, sriracha, 3 tbsp hot water.','Drain noodles, toss with sauce while warm.','Add red pepper and scallions.','Garnish with crushed peanuts and extra sriracha.'] },

  { title:'Indian Spiced Red Pepper Soup', description:'Silky roasted red pepper and tomato soup brightened with cumin and coriander.', category:'Vegan', emoji:'🌿', color:V, prep_time:10, cook_time:30, servings:4, contains:[], tags:['vegan','soup','gf','quick'],
    ingredients:['4 red peppers, halved','4 tomatoes, halved','1 onion, quartered','4 garlic cloves','1 tsp cumin','1 tsp coriander','700ml vegetable stock','2 tbsp olive oil, salt, chilli flakes'],
    instructions:['Roast peppers, tomatoes, onion, garlic with oil at 200°C for 25 minutes.','Transfer to a blender with stock and spices. Blend smooth.','Pour into pot, heat through. Season.','Serve with crusty bread and a swirl of olive oil.'] },

  { title:'Lentil Vegetable Soup', description:'Hearty vegetable and lentil soup — the kind you make a big pot of and eat all week.', category:'Vegan', emoji:'🌿', color:V, prep_time:15, cook_time:35, servings:6, contains:[], tags:['vegan','soup','gf','meal-prep'],
    ingredients:['200g green lentils','2 carrots, diced','2 celery stalks, diced','1 onion, diced','3 garlic cloves','1 can diced tomatoes','1.2L vegetable stock','1 tsp cumin, 1 tsp turmeric, salt, lemon'],
    instructions:['Sauté onion, carrot, celery 8 minutes. Add garlic and spices, cook 2 minutes.','Add lentils, tomatoes, stock. Bring to a boil.','Simmer 30 minutes until lentils are tender.','Finish with lemon juice. Season generously.'] },

  { title:'Corn & Avocado Salad', description:'Sweet corn, avocado, cherry tomatoes, and lime dressing — summer in a bowl.', category:'Vegan', emoji:'🌿', color:V, prep_time:15, cook_time:5, servings:4, contains:[], tags:['vegan','salad','gf','quick','no-cook'],
    ingredients:['400g corn (fresh, frozen, or canned)','2 avocados, diced','200g cherry tomatoes, halved','½ red onion, finely diced','1 jalapeño, minced','Juice of 2 limes','3 tbsp olive oil, salt, coriander'],
    instructions:['Char corn in a dry skillet 5 minutes if using fresh or frozen.','Combine all vegetables in a bowl.','Whisk lime juice and olive oil. Season.','Toss gently. Serve immediately or chill 30 minutes.'] },

  { title:'Spicy Kimchi Fried Rice', description:'Tangy, spicy kimchi fried rice with crispy edges and sesame oil — 15 minutes.', category:'Vegan', emoji:'🌿', color:V, prep_time:5, cook_time:15, servings:4, contains:[], tags:['vegan','rice','korean','quick','gf'],
    ingredients:['600g cooked rice (day-old works best)','200g vegan kimchi, roughly chopped','3 garlic cloves, minced','2 tbsp soy sauce','1 tsp sesame oil','2 scallions, sliced','2 tbsp vegetable oil','Sesame seeds'],
    instructions:['Heat oil in a wok over very high heat. Add garlic, stir 30 seconds.','Add kimchi and cook 3 minutes until slightly caramelised.','Add rice, spreading flat — cook undisturbed 2 minutes for crispy bits. Toss.','Add soy sauce and sesame oil. Top with scallions and sesame seeds.'] },

  { title:'Roasted Tomato Pasta (Vegan)', description:'Slow-roasted tomatoes burst into the most intensely flavoured sauce — worth every minute.', category:'Vegan', emoji:'🌿', color:V, prep_time:5, cook_time:40, servings:4, contains:['gluten'], tags:['vegan','pasta','roasted','italian'],
    ingredients:['600g cherry tomatoes','6 garlic cloves, unpeeled','5 tbsp olive oil','400g pasta','1 tsp chilli flakes','Large handful fresh basil','Salt and pepper'],
    instructions:['Halve tomatoes, place with garlic on baking tray with olive oil and salt. Roast at 190°C for 35 minutes.','Cook pasta until al dente. Reserve 1 cup pasta water.','Squeeze garlic from skins into roasted tomatoes. Toss with pasta.','Add pasta water to loosen. Stir in basil and chilli flakes.'] },

  { title:'Coconut Rice with Mango Salsa', description:'Fragrant coconut rice paired with a bright mango, lime, and chilli salsa.', category:'Vegan', emoji:'🌿', color:V, prep_time:15, cook_time:20, servings:4, contains:[], tags:['vegan','rice','tropical','gf'],
    ingredients:['350g jasmine rice','400ml coconut milk','200ml water','2 mangos, diced','1 red chilli, minced','Juice of 2 limes','½ red onion, minced','Salt, coriander'],
    instructions:['Combine rice, coconut milk, water, and ½ tsp salt. Bring to boil.','Reduce heat, cover, cook 15 minutes. Rest 5 minutes.','Combine mango, chilli, lime juice, red onion, coriander.','Fluff rice and serve topped with mango salsa.'] },

  { title:'Aubergine & Chickpea Tagine', description:'Tender aubergine and chickpeas in a warming North African spiced tomato sauce.', category:'Vegan', emoji:'🌿', color:V, prep_time:15, cook_time:35, servings:4, contains:[], tags:['vegan','tagine','moroccan','gf'],
    ingredients:['2 aubergines, cubed','2 cans chickpeas, drained','1 can crushed tomatoes','1 onion, diced','2 tsp ras el hanout','1 cinnamon stick','100ml vegetable stock','Almonds, coriander to serve'],
    instructions:['Fry aubergine in batches until golden. Remove.','Sauté onion 5 minutes. Add ras el hanout and cinnamon, cook 1 minute.','Add tomatoes, stock, chickpeas, and aubergine. Simmer 25 minutes.','Scatter almonds and coriander. Serve with couscous.'] },

  { title:'Vietnamese Noodle Bowl (Bún)', description:'Rice noodles with fresh herbs, pickled vegetables, and a punchy nước chấm dressing.', category:'Vegan', emoji:'🌿', color:V, prep_time:20, cook_time:5, servings:4, contains:[], tags:['vegan','noodles','vietnamese','gf','fresh'],
    ingredients:['300g rice vermicelli','2 carrots, julienned','1 cucumber, julienned','100g bean sprouts','Large handful mint and basil','4 tbsp soy sauce','2 tbsp lime juice','1 tsp sugar, 1 garlic clove, chilli'],
    instructions:['Soak noodles in boiling water 5 minutes, drain and rinse.','Mix soy sauce, lime, sugar, garlic, chilli for dressing.','Arrange noodles in bowls with vegetables and herbs on top.','Spoon dressing over just before serving.'] },

  { title:'Shakshuka (Vegan-Optional)', description:'Baked eggs in a spiced tomato sauce — skip the eggs and cheese for a fully vegan version.', category:'Vegan', emoji:'🌿', color:V, prep_time:10, cook_time:25, servings:4, contains:[], tags:['vegan','gf','one-pan'],
    ingredients:['1 can crushed tomatoes','1 can chickpeas, drained','1 onion, diced','3 garlic cloves','1 red pepper, diced','1 tsp cumin','1 tsp smoked paprika','Chilli flakes, olive oil, parsley'],
    instructions:['Sauté onion and pepper in oil 7 minutes. Add garlic and spices, cook 1 minute.','Add tomatoes and chickpeas. Simmer 15 minutes until thickened.','Season generously with salt and chilli flakes.','Serve straight from pan with crusty bread.'] },

  { title:'Spicy Peanut Sweet Potato Stew', description:'West African-inspired peanut stew with sweet potato and greens — creamy, complex, warming.', category:'Vegan', emoji:'🌿', color:V, prep_time:15, cook_time:30, servings:4, contains:['nuts'], tags:['vegan','stew','african','gf','peanut'],
    ingredients:['2 sweet potatoes, cubed','100g peanut butter','1 can diced tomatoes','700ml vegetable stock','1 onion, diced','3 garlic cloves','1 tsp ginger','100g spinach, salt, chilli'],
    instructions:['Sauté onion, garlic, ginger 5 minutes.','Add tomatoes, stock, sweet potato. Simmer 20 minutes.','Stir in peanut butter until fully dissolved. Season with salt and chilli.','Add spinach, stir until wilted. Serve with rice.'] },

  // ── VEGETARIAN (non-vegan, 25) ─────────────────────────────────────────────
  { title:'Shakshuka', description:'Eggs poached in a rich, spiced tomato and pepper sauce — a one-pan dinner that feels both exotic and comforting.', category:'Vegetarian', emoji:'🥗', color:G, prep_time:10, cook_time:25, servings:4, contains:['eggs','dairy'], tags:['vegetarian','eggs','one-pan','gf'],
    ingredients:['2 tbsp olive oil','1 onion, diced','1 red bell pepper, diced','4 garlic cloves, minced','1 tsp cumin, 1 tsp smoked paprika, pinch cayenne','1 can (28oz) crushed tomatoes','4–6 eggs','100g feta, fresh parsley'],
    instructions:['Sauté onion and pepper in oil 7 minutes. Add garlic and spices, cook 1 minute.','Pour in tomatoes, simmer 10 minutes, season well.','Make wells, crack in eggs, cover and cook 5–8 minutes until whites set.','Top with feta and parsley. Serve with crusty bread.'] },

  { title:'Mushroom & Parmesan Pasta', description:'Earthy mushrooms, garlic, white wine, and Parmesan — a weeknight pasta that tastes like a restaurant.', category:'Vegetarian', emoji:'🥗', color:G, prep_time:10, cook_time:20, servings:4, contains:['gluten','dairy'], tags:['vegetarian','pasta','mushroom','quick'],
    ingredients:['400g tagliatelle','500g mixed mushrooms, sliced','4 garlic cloves','1 shallot, diced','100ml dry white wine','200ml heavy cream','60g Parmesan, grated','2 tbsp butter, fresh thyme'],
    instructions:['Cook pasta, reserve 1 cup pasta water.','Fry mushrooms in butter until golden, add shallot and garlic.','Add wine, reduce by half. Add cream, simmer 3 minutes.','Toss with pasta and Parmesan, using pasta water to loosen.'] },

  { title:'Butternut Squash Risotto', description:'Silky, golden risotto made luxurious with roasted squash and sage butter.', category:'Vegetarian', emoji:'🥗', color:G, prep_time:15, cook_time:40, servings:4, contains:['dairy'], tags:['vegetarian','risotto','gf','autumn'],
    ingredients:['400g arborio rice','700g butternut squash, roasted and mashed','1.2L warm vegetable stock','1 onion, diced','100ml dry white wine','80g Parmesan, grated','4 tbsp butter','8 sage leaves'],
    instructions:['Sauté onion in 2 tbsp butter. Add rice, toast 2 minutes. Add wine.','Add warm stock ladle by ladle, stirring constantly — about 25 minutes.','Stir in squash purée, Parmesan, remaining butter. Season.','Fry sage in a little butter until crisp. Top risotto with sage.'] },

  { title:'Paneer Tikka Masala', description:'Charred paneer in a velvety tomato and cream masala sauce — a vegetarian showstopper.', category:'Vegetarian', emoji:'🥗', color:G, prep_time:20, cook_time:30, servings:4, contains:['dairy'], tags:['vegetarian','indian','curry','gf'],
    ingredients:['400g paneer, cubed','1 can crushed tomatoes','1 onion, diced','4 garlic cloves, 1 tsp ginger','1 tbsp garam masala','1 tsp turmeric','100ml heavy cream','2 tbsp butter, coriander, rice'],
    instructions:['Fry paneer until golden on each side. Remove.','Sauté onion in butter 8 minutes. Add garlic, ginger, spices — cook 2 minutes.','Add tomatoes, simmer 15 minutes. Blend smooth if desired.','Add cream and paneer, heat through. Serve with rice and naan.'] },

  { title:'Spinach & Feta Frittata', description:'Golden-edged frittata packed with wilted spinach, feta, and herbs — perfect hot or cold.', category:'Vegetarian', emoji:'🥗', color:G, prep_time:10, cook_time:20, servings:4, contains:['eggs','dairy'], tags:['vegetarian','eggs','gf','quick'],
    ingredients:['8 eggs','200g baby spinach','150g feta, crumbled','1 onion, sliced','2 garlic cloves','2 tbsp olive oil','Salt, pepper, fresh dill'],
    instructions:['Preheat oven to 180°C. Sauté onion and garlic in an ovenproof skillet 5 minutes.','Add spinach, cook until wilted. Season.','Beat eggs with salt and pepper. Pour over vegetables.','Cook on stovetop 3 minutes then transfer to oven for 10–12 minutes until set.'] },

  { title:'Pasta Primavera', description:'Fresh spring vegetables tossed with pasta in a light lemon and Parmesan sauce.', category:'Vegetarian', emoji:'🥗', color:G, prep_time:15, cook_time:15, servings:4, contains:['gluten','dairy'], tags:['vegetarian','pasta','spring','quick'],
    ingredients:['400g penne','2 courgettes, sliced','200g asparagus, chopped','100g peas','3 garlic cloves','Zest and juice of 1 lemon','60g Parmesan, grated','4 tbsp good olive oil'],
    instructions:['Cook pasta. Sauté courgettes and asparagus in oil 5 minutes. Add garlic.','Add peas and cook 2 minutes. Season well.','Toss vegetables with drained pasta, lemon zest, juice, and Parmesan.','Add a little pasta water if needed to loosen.'] },

  { title:'Caprese with Burrata', description:'Creamy burrata on ripe tomatoes with basil and balsamic — simple perfection.', category:'Vegetarian', emoji:'🥗', color:G, prep_time:10, cook_time:0, servings:4, contains:['dairy'], tags:['vegetarian','gf','no-cook','italian'],
    ingredients:['2 balls burrata','4 large ripe tomatoes, sliced','Large handful fresh basil','4 tbsp extra-virgin olive oil','Balsamic glaze','Flaky sea salt, black pepper'],
    instructions:['Layer tomato slices on a platter. Season with salt.','Tear burrata over tomatoes.','Scatter fresh basil leaves.','Drizzle with olive oil and balsamic glaze. Serve immediately.'] },

  { title:'Veggie Quesadillas', description:'Crispy flour tortillas filled with black beans, corn, cheese, and jalapeño.', category:'Vegetarian', emoji:'🥗', color:G, prep_time:10, cook_time:15, servings:4, contains:['gluten','dairy'], tags:['vegetarian','mexican','quick','kids'],
    ingredients:['8 flour tortillas','200g grated cheddar','1 can black beans, drained','100g corn','1 jalapeño, diced','1 red pepper, diced','Sour cream, salsa, guacamole to serve'],
    instructions:['Combine beans, corn, jalapeño, red pepper, and cheese.','Spread filling over half of each tortilla, fold over.','Cook in a dry pan 2–3 minutes per side until golden.','Slice and serve with sour cream, salsa, guacamole.'] },

  { title:'Mac & Cheese', description:'The ultimate baked mac — sharp cheddar béchamel, crispy breadcrumb top, perfectly gooey.', category:'Vegetarian', emoji:'🥗', color:G, prep_time:15, cook_time:30, servings:4, contains:['gluten','dairy'], tags:['vegetarian','pasta','comfort','kids'],
    ingredients:['400g macaroni','60g butter','60g plain flour','700ml whole milk','300g sharp cheddar, grated','1 tsp mustard powder','Pinch of nutmeg','50g breadcrumbs, salt'],
    instructions:['Cook macaroni. Melt butter, add flour, whisk 2 minutes. Gradually add milk, stirring until thick.','Add cheese, mustard, nutmeg. Season generously.','Mix with macaroni. Pour into baking dish, top with breadcrumbs.','Bake at 190°C for 20 minutes until golden and bubbling.'] },

  { title:'Broccoli Cheddar Soup', description:'Velvety, comforting soup thick with broccoli and sharp cheddar — a classic done right.', category:'Vegetarian', emoji:'🥗', color:G, prep_time:10, cook_time:25, servings:4, contains:['dairy','gluten'], tags:['vegetarian','soup','comfort'],
    ingredients:['1 large head broccoli, chopped','1 onion, diced','2 garlic cloves','2 tbsp butter','2 tbsp plain flour','700ml vegetable stock','200ml whole milk','200g sharp cheddar, grated'],
    instructions:['Sauté onion in butter 5 minutes. Add garlic and flour, stir 2 minutes.','Add stock and broccoli. Simmer 15 minutes until very tender.','Add milk. Blend about half the soup for creamy-chunky texture.','Stir in cheddar until melted. Season well.'] },

  { title:'Cheese & Herb Omelette', description:'A perfectly folded French omelette with Gruyère and fresh herbs — 5-minute dinner.', category:'Vegetarian', emoji:'🥗', color:G, prep_time:5, cook_time:5, servings:2, contains:['eggs','dairy'], tags:['vegetarian','eggs','gf','quick'],
    ingredients:['4 large eggs','30g Gruyère, grated','1 tbsp fresh chives, chopped','1 tbsp fresh tarragon or parsley','1 tbsp butter','Salt and white pepper'],
    instructions:['Beat eggs with salt and a splash of cold water.','Melt butter in a small pan over medium heat until foaming.','Add eggs, stir gently and push edges in as they set.','Add cheese and herbs, fold in half, slide onto plate.'] },

  { title:'Mushroom Risotto', description:'Classic creamy mushroom risotto with porcini depth and a finish of Parmesan and butter.', category:'Vegetarian', emoji:'🥗', color:G, prep_time:10, cook_time:35, servings:4, contains:['dairy'], tags:['vegetarian','risotto','gf','mushroom'],
    ingredients:['400g arborio rice','500g mushrooms (mix of cremini and dried porcini)','1.2L warm vegetable stock','1 onion, diced','100ml dry white wine','80g Parmesan','4 tbsp butter','Fresh thyme, parsley'],
    instructions:['Soak porcini in 200ml hot water. Sauté onion in butter.','Add rice, toast 2 minutes. Add wine, reduce. Add porcini soaking liquid (strained).','Add warm stock ladle by ladle, stirring 25 minutes. Sauté fresh mushrooms separately.','Stir in Parmesan, butter, mushrooms. Rest 2 minutes before serving.'] },

  { title:'Warm Lentil Salad with Feta', description:'Earthy French lentils with roasted root vegetables, feta, and mustard dressing — substantial and bright.', category:'Vegetarian', emoji:'🥗', color:G, prep_time:15, cook_time:30, servings:4, contains:['dairy'], tags:['vegetarian','salad','lentil','gf'],
    ingredients:['300g puy or green lentils','2 beetroots, roasted and cubed','2 carrots, roasted','100g feta, crumbled','3 tbsp olive oil','1 tbsp red wine vinegar','1 tsp Dijon mustard','Handful of watercress'],
    instructions:['Cook lentils in salted water 20 minutes until just tender. Drain.','Whisk olive oil, vinegar, mustard. Season.','Toss warm lentils with dressing while still warm.','Layer with roasted vegetables, watercress, feta.'] },

  { title:'Zucchini Fritters', description:'Crispy courgette and feta fritters with a cooling yogurt dip — quick and satisfying.', category:'Vegetarian', emoji:'🥗', color:G, prep_time:15, cook_time:15, servings:4, contains:['eggs','dairy','gluten'], tags:['vegetarian','fritters','quick'],
    ingredients:['3 courgettes, grated','2 eggs, beaten','100g feta, crumbled','3 tbsp plain flour','2 scallions, sliced','Salt, pepper','150g Greek yogurt, 1 garlic clove, dill for dip'],
    instructions:['Salt grated courgette, rest 10 minutes, squeeze out all moisture.','Mix with eggs, feta, flour, scallions. Season.','Fry heaped spoonfuls in oil 3 minutes per side until golden.','Serve with yogurt dip made with garlic and dill.'] },

  { title:'Baked Feta with Tomatoes', description:'Feta baked until golden in a dish of cherry tomatoes, olives, and herbs — made famous for good reason.', category:'Vegetarian', emoji:'🥗', color:G, prep_time:5, cook_time:30, servings:4, contains:['dairy'], tags:['vegetarian','baked','gf','easy'],
    ingredients:['200g block feta','400g cherry tomatoes','100g olives','4 garlic cloves, unpeeled','1 tsp dried oregano','1 tsp chilli flakes','4 tbsp olive oil','Fresh basil'],
    instructions:['Place feta in center of baking dish. Surround with tomatoes, olives, garlic.','Drizzle everything with olive oil. Season with oregano, chilli flakes.','Bake at 200°C for 25–30 minutes until feta is golden.','Scatter basil. Serve with crusty bread for scooping.'] },

  { title:'Halloumi & Vegetable Skewers', description:'Golden halloumi with summer vegetables grilled until caramelised — the star of any barbecue.', category:'Vegetarian', emoji:'🥗', color:G, prep_time:15, cook_time:15, servings:4, contains:['dairy'], tags:['vegetarian','gf','grill','bbq'],
    ingredients:['250g halloumi, cubed','2 courgettes, chunked','1 red and 1 yellow pepper, chunked','200g cherry tomatoes','2 tbsp olive oil','1 tsp dried oregano','Juice of ½ lemon','Tzatziki to serve'],
    instructions:['Thread halloumi, courgette, pepper, tomatoes onto skewers alternating.','Brush with olive oil, sprinkle oregano, season.','Grill or cook in a griddle pan 3–4 minutes per side until charred.','Squeeze lemon over, serve with tzatziki.'] },

  { title:'Spinach Ricotta Stuffed Shells', description:'Jumbo pasta shells filled with herbed ricotta and spinach, baked in tomato sauce.', category:'Vegetarian', emoji:'🥗', color:G, prep_time:20, cook_time:30, servings:4, contains:['gluten','dairy','eggs'], tags:['vegetarian','pasta','baked','italian'],
    ingredients:['20 jumbo pasta shells','400g ricotta','200g frozen spinach, thawed and squeezed','1 egg','60g Parmesan','1 jar (700ml) marinara sauce','150g mozzarella','Nutmeg, salt, pepper'],
    instructions:['Cook shells until just pliable. Mix ricotta, spinach, egg, Parmesan, nutmeg, seasoning.','Pour half the marinara into a baking dish. Fill shells with ricotta mixture.','Arrange in dish, top with remaining sauce and mozzarella.','Bake at 190°C for 25 minutes until bubbling and golden.'] },

  { title:'Vegetable Lasagna', description:'Layers of roasted vegetables, béchamel, and mozzarella — comfort food at its best.', category:'Vegetarian', emoji:'🥗', color:G, prep_time:30, cook_time:45, servings:6, contains:['gluten','dairy','eggs'], tags:['vegetarian','pasta','baked','weekend'],
    ingredients:['12 lasagna sheets','2 courgettes','2 red peppers','1 aubergine','500ml béchamel sauce (butter, flour, milk)','400g tomato sauce','200g mozzarella','60g Parmesan'],
    instructions:['Roast chunked vegetables at 220°C for 20 minutes.','Layer lasagna: tomato sauce, pasta, vegetables, béchamel, repeat.','Top with mozzarella and Parmesan.','Bake at 190°C for 35 minutes until golden. Rest 10 minutes before slicing.'] },

  { title:'Greek Salad with Warm Pita', description:'Crisp cucumbers, ripe tomatoes, olives, and feta with warm toasted pita — a complete meal.', category:'Vegetarian', emoji:'🥗', color:G, prep_time:15, cook_time:5, servings:4, contains:['dairy','gluten'], tags:['vegetarian','salad','greek','quick'],
    ingredients:['4 pita breads','3 tomatoes, chunked','1 cucumber, chunked','100g kalamata olives','150g feta, cubed','½ red onion, sliced','3 tbsp olive oil','1 tbsp red wine vinegar, dried oregano'],
    instructions:['Toast pita until warm and slightly crisp.','Combine tomatoes, cucumber, olives, feta, onion.','Dress with olive oil, vinegar, oregano. Toss gently.','Serve salad alongside warm pita for scooping.'] },

  { title:'Egg Fried Rice', description:'Better than takeout egg fried rice — the secret is day-old rice and very high heat.', category:'Vegetarian', emoji:'🥗', color:G, prep_time:5, cook_time:10, servings:4, contains:['eggs'], tags:['vegetarian','rice','quick','gf','kids'],
    ingredients:['600g cooked rice (day-old)','3 eggs, beaten','150g frozen peas','3 garlic cloves, minced','3 tbsp soy sauce','2 tsp sesame oil','3 tbsp vegetable oil','3 scallions, sliced'],
    instructions:['Heat oil in wok over very high heat. Add garlic, stir 30 seconds.','Add rice, spread flat and cook undisturbed 2 minutes for crispy bits. Toss.','Push rice aside, add eggs and scramble until just set. Mix through rice.','Add peas, soy sauce, sesame oil, scallions. Toss and serve.'] },

  { title:'Asparagus & Gruyère Tart', description:'Flaky pastry topped with creamy Gruyère custard and tender asparagus — elegant yet simple.', category:'Vegetarian', emoji:'🥗', color:G, prep_time:15, cook_time:30, servings:6, contains:['gluten','dairy','eggs'], tags:['vegetarian','tart','french','brunch'],
    ingredients:['1 sheet puff pastry','1 bunch asparagus, trimmed','3 eggs','200ml crème fraîche','150g Gruyère, grated','1 garlic clove, minced','Salt, pepper, fresh thyme'],
    instructions:['Unroll pastry, score a 1cm border. Prick inside with a fork.','Whisk eggs, crème fraîche, Gruyère, garlic, seasoning.','Pour filling inside border, lay asparagus on top.','Bake at 200°C for 25–30 minutes until golden and set.'] },

  { title:'Cauliflower Mac & Cheese', description:'Roasted cauliflower adds nutty depth to a sharp cheddar mac — comfort food made interesting.', category:'Vegetarian', emoji:'🥗', color:G, prep_time:15, cook_time:35, servings:4, contains:['gluten','dairy'], tags:['vegetarian','pasta','comfort','roasted'],
    ingredients:['400g macaroni','1 head cauliflower, cut small','60g butter','60g flour','700ml milk','250g mature cheddar','1 tsp mustard powder','Breadcrumbs for topping'],
    instructions:['Roast cauliflower with oil at 220°C 20 minutes until golden.','Make béchamel: melt butter, whisk in flour, add milk gradually until thick. Add cheddar and mustard.','Cook pasta, mix with sauce and cauliflower. Transfer to baking dish.','Top with breadcrumbs, bake at 190°C 15 minutes until golden.'] },

  // ── CHICKEN (25) ──────────────────────────────────────────────────────────
  { title:'Lemon Herb Chicken Thighs', description:'Crispy-skinned chicken thighs roasted with lemon, garlic, and fresh herbs — endlessly reliable.', category:'Chicken', emoji:'🍗', color:C, prep_time:10, cook_time:35, servings:4, contains:['meat'], tags:['chicken','roasted','lemon','gf'],
    ingredients:['8 bone-in chicken thighs','3 tbsp olive oil','Zest and juice of 1 lemon','4 garlic cloves, minced','1 tsp oregano','1 tsp thyme','1 tsp paprika','Salt, pepper, fresh parsley'],
    instructions:['Preheat oven to 425°F / 220°C.','Mix oil, lemon zest, garlic, herbs, paprika. Rub all over chicken.','Roast skin-side up 35–40 minutes until golden and cooked through.','Rest 5 minutes. Serve with pan juices.'] },

  { title:'Thai Basil Chicken', description:'Fragrant, slightly spicy stir-fry that makes you stop ordering takeout — 20 minutes.', category:'Chicken', emoji:'🍗', color:C, prep_time:10, cook_time:15, servings:4, contains:['meat'], tags:['chicken','thai','stir-fry','quick','gf'],
    ingredients:['500g ground chicken','4 garlic cloves, minced','2 red chillies, minced','1 bunch Thai basil','2 tbsp fish sauce','1 tbsp oyster sauce','1 tbsp soy sauce','1 tsp sugar, oil, rice'],
    instructions:['Mix fish sauce, oyster sauce, soy sauce, sugar.','Cook garlic and chilli in oil over high heat 30 seconds. Add chicken, stir-fry 5 minutes.','Pour in sauce, toss 1 minute.','Remove from heat, fold in basil. Serve over rice with fried egg.'] },

  { title:'Honey Garlic Chicken', description:'Golden chicken in a sticky honey-garlic glaze that the whole table will fight over.', category:'Chicken', emoji:'🍗', color:C, prep_time:5, cook_time:25, servings:4, contains:['meat'], tags:['chicken','honey','quick','gf'],
    ingredients:['8 boneless chicken thighs','4 garlic cloves, minced','3 tbsp honey','2 tbsp soy sauce','1 tbsp apple cider vinegar','1 tbsp oil','Sesame seeds, scallions'],
    instructions:['Season and sear chicken 5–6 minutes per side. Remove.','Cook garlic 1 minute. Add honey, soy sauce, vinegar — simmer 2 minutes.','Return chicken, coat in glaze, cook 5 more minutes.','Serve with rice, sesame seeds, and scallions.'] },

  { title:'Chicken Tikka Masala', description:'Tender marinated chicken in a velvety, spiced tomato cream sauce — a true crowd pleaser.', category:'Chicken', emoji:'🍗', color:C, prep_time:20, cook_time:30, servings:4, contains:['meat','dairy'], tags:['chicken','indian','curry','gf'],
    ingredients:['700g chicken breast, cubed','150g yogurt','1 tbsp garam masala, 1 tsp cumin, 1 tsp turmeric','1 can crushed tomatoes','100ml cream','1 onion, 4 garlic, 1 tsp ginger','2 tbsp butter, coriander, rice'],
    instructions:['Marinate chicken in yogurt and spices 30 minutes (or overnight). Grill or fry until charred.','Sauté onion, garlic, ginger in butter. Add spices, cook 2 minutes. Add tomatoes, simmer 15 minutes.','Blend sauce smooth. Add cream and chicken, heat through.','Finish with coriander. Serve with rice and naan.'] },

  { title:'Greek Lemon Chicken', description:'Chicken braised with lemon, olives, and herbs in a bright Mediterranean broth.', category:'Chicken', emoji:'🍗', color:C, prep_time:10, cook_time:40, servings:4, contains:['meat'], tags:['chicken','greek','gf','braised'],
    ingredients:['8 chicken pieces (thighs and drumsticks)','Juice and zest of 2 lemons','100g green olives','4 garlic cloves','200ml chicken stock','1 tsp dried oregano','3 tbsp olive oil','Fresh dill to serve'],
    instructions:['Brown chicken pieces in oil on all sides, 8 minutes. Remove.','Add garlic to pan, cook 1 minute. Add stock, lemon juice, olives, oregano.','Return chicken, cover, simmer 30 minutes until cooked through.','Finish with lemon zest and fresh dill. Serve with bread or rice.'] },

  { title:'Chicken Shawarma', description:'Spiced chicken piled into warm flatbreads with tahini, tomatoes, and pickles.', category:'Chicken', emoji:'🍗', color:C, prep_time:15, cook_time:20, servings:4, contains:['meat','gluten'], tags:['chicken','middle-eastern','quick','shawarma'],
    ingredients:['700g chicken thighs, sliced','2 tsp cumin, 2 tsp paprika, 1 tsp turmeric','Juice of 1 lemon','4 garlic cloves, minced','Flatbreads, tahini, tomatoes, pickled cucumber','Yogurt sauce: yogurt, lemon, garlic, dill'],
    instructions:['Marinate chicken with spices, lemon, garlic, oil — 30 minutes to overnight.','Fry in a hot pan 8–10 minutes until golden and cooked through.','Warm flatbreads. Spread with tahini.','Load with chicken, tomatoes, pickles, and yogurt sauce.'] },

  { title:'Butter Chicken', description:'The Indian restaurant classic — tender chicken in a silky, buttery, mildly spiced tomato sauce.', category:'Chicken', emoji:'🍗', color:C, prep_time:20, cook_time:35, servings:4, contains:['meat','dairy'], tags:['chicken','indian','curry','gf','mild'],
    ingredients:['700g chicken breast, cubed','150g yogurt','1 tbsp garam masala, 1 tsp cumin','1 can crushed tomatoes','150ml cream','100g butter','1 onion, 4 garlic, 1 tsp ginger','Sugar, salt, coriander'],
    instructions:['Marinate chicken in yogurt and spices. Grill or pan-fry until lightly charred.','Sauté onion in butter 8 minutes. Add garlic, ginger, spices, tomatoes. Simmer 15 minutes.','Blend smooth. Add cream, a pinch of sugar, seasoning. Simmer 5 minutes.','Add chicken, heat through. Finish with butter and coriander.'] },

  { title:'Chicken Piccata', description:'Pan-seared chicken in a bright lemon-caper butter sauce — elegant and surprisingly quick.', category:'Chicken', emoji:'🍗', color:C, prep_time:10, cook_time:20, servings:4, contains:['meat','gluten','dairy'], tags:['chicken','italian','quick','lemon'],
    ingredients:['4 chicken breasts, pounded thin','60g plain flour','60ml dry white wine','60ml chicken stock','Juice of 1 lemon','2 tbsp capers','4 tbsp butter','2 tbsp olive oil, fresh parsley'],
    instructions:['Dredge chicken in flour, season. Sear in oil 3 minutes per side until golden. Remove.','Add wine to pan, reduce by half. Add stock, lemon juice, capers — simmer 2 minutes.','Swirl in butter until sauce emulsifies. Return chicken, spoon sauce over.','Garnish with parsley. Serve with pasta or mashed potato.'] },

  { title:'Coconut Chicken Curry', description:'Fragrant, mild coconut curry packed with vegetables — family-friendly and deeply satisfying.', category:'Chicken', emoji:'🍗', color:C, prep_time:15, cook_time:30, servings:4, contains:['meat'], tags:['chicken','curry','coconut','gf','mild'],
    ingredients:['600g chicken thighs, cubed','400ml coconut milk','1 onion, 3 garlic, 1 tsp ginger','2 tbsp red curry paste','1 red pepper, 100g green beans','1 tbsp fish sauce','Lime juice, Thai basil, rice'],
    instructions:['Fry curry paste 1 minute. Add onion, garlic, ginger — cook 5 minutes.','Add chicken, stir to coat. Cook 5 minutes.','Add coconut milk, fish sauce. Simmer 15 minutes.','Add vegetables, cook 8 more minutes. Finish with lime and basil.'] },

  { title:'Miso Chicken Thighs', description:'Umami-rich miso glaze on chicken thighs — sticky, complex, and incredibly easy.', category:'Chicken', emoji:'🍗', color:C, prep_time:10, cook_time:30, servings:4, contains:['meat'], tags:['chicken','miso','japanese','gf','weeknight'],
    ingredients:['8 bone-in chicken thighs','3 tbsp white miso','2 tbsp mirin','1 tbsp soy sauce','1 tbsp honey','2 garlic cloves, grated','Sesame seeds, scallions'],
    instructions:['Mix miso, mirin, soy, honey, garlic into a glaze.','Score chicken skin, rub glaze all over. Rest 30 minutes if time allows.','Roast at 220°C for 25–30 minutes until skin is golden and sticky.','Serve scattered with sesame seeds and sliced scallions.'] },

  { title:'BBQ Chicken Drumsticks', description:'Smoky-sweet glazed drumsticks cooked until falling-off-the-bone tender.', category:'Chicken', emoji:'🍗', color:C, prep_time:10, cook_time:40, servings:4, contains:['meat'], tags:['chicken','bbq','gf','family'],
    ingredients:['12 chicken drumsticks','4 tbsp ketchup','2 tbsp brown sugar','1 tbsp apple cider vinegar','1 tbsp Worcestershire sauce','1 tsp smoked paprika','2 garlic cloves, minced','Salt, pepper'],
    instructions:['Mix all sauce ingredients. Reserve half for serving.','Coat drumsticks in sauce. Rest 20 minutes.','Roast at 200°C for 35–40 minutes, basting halfway, until cooked through and sticky.','Serve with reserved sauce and coleslaw.'] },

  { title:'Sheet Pan Chicken & Vegetables', description:'One pan, everything roasted together — chicken thighs, potatoes, and seasonal vegetables.', category:'Chicken', emoji:'🍗', color:C, prep_time:10, cook_time:40, servings:4, contains:['meat'], tags:['chicken','one-pan','gf','weeknight','easy'],
    ingredients:['8 chicken thighs, bone-in','400g baby potatoes, halved','2 courgettes, chunked','1 red onion, wedged','1 lemon, sliced','4 garlic cloves','3 tbsp olive oil','Dried herbs, salt, pepper'],
    instructions:['Toss potatoes with oil, herbs, salt. Spread on a large baking tray.','Nestle chicken on top. Scatter courgette, onion, lemon, garlic around chicken.','Roast at 220°C for 35–40 minutes until chicken is golden and vegetables caramelised.','Serve straight from the pan.'] },

  { title:'Za\'atar Chicken', description:'Chicken thighs coated in earthy za\'atar and lemon — a Middle Eastern weeknight hero.', category:'Chicken', emoji:'🍗', color:C, prep_time:10, cook_time:30, servings:4, contains:['meat'], tags:['chicken','middle-eastern','gf','quick'],
    ingredients:['8 boneless chicken thighs','3 tbsp za\'atar spice blend','Juice and zest of 1 lemon','3 tbsp olive oil','3 garlic cloves, minced','Salt, sumac, fresh parsley','Flatbreads and yogurt to serve'],
    instructions:['Mix za\'atar, lemon juice, zest, olive oil, garlic. Rub all over chicken.','Marinate 30 minutes or overnight.','Roast at 220°C for 25–30 minutes until cooked through.','Serve with flatbreads, yogurt, and fresh parsley.'] },

  { title:'Chicken Caesar Salad', description:'Crispy chicken over romaine with classic Caesar dressing and croutons — satisfying and crowd-pleasing.', category:'Chicken', emoji:'🍗', color:C, prep_time:15, cook_time:15, servings:4, contains:['meat','dairy','gluten','eggs'], tags:['chicken','salad','caesar','classic'],
    ingredients:['4 chicken breasts','2 romaine lettuces, torn','80g Parmesan, shaved','Caesar dressing: 2 anchovy fillets, 1 garlic, 1 tsp mustard, 1 egg yolk, lemon, olive oil','Croutons: stale bread, olive oil, garlic'],
    instructions:['Grill or pan-fry chicken 6 minutes per side. Rest and slice.','Make dressing: blend anchovies, garlic, mustard, egg yolk, lemon, oil until smooth.','Toss lettuce with dressing and croutons.','Top with chicken and Parmesan.'] },

  { title:'Chicken Fajitas', description:'Sizzling strips of spiced chicken with peppers and onions in warm flour tortillas.', category:'Chicken', emoji:'🍗', color:C, prep_time:15, cook_time:15, servings:4, contains:['meat','gluten','dairy'], tags:['chicken','mexican','quick','family'],
    ingredients:['600g chicken breast, sliced','2 peppers (red and green), sliced','1 onion, sliced','2 tsp cumin','2 tsp smoked paprika','Flour tortillas','Sour cream, salsa, guacamole, lime'],
    instructions:['Season chicken with cumin, paprika, salt.','Cook chicken in a hot pan with oil 5–6 minutes. Remove.','Fry peppers and onion in the same pan 5 minutes until softened.','Warm tortillas. Serve with chicken, peppers, and all toppings.'] },

  { title:'Chicken Souvlaki', description:'Lemon-herb marinated chicken skewers with tzatziki and warm pita — simple Greek perfection.', category:'Chicken', emoji:'🍗', color:C, prep_time:20, cook_time:12, servings:4, contains:['meat','gluten','dairy'], tags:['chicken','greek','gf','bbq'],
    ingredients:['700g chicken thighs, cubed','Juice of 1 lemon','3 tbsp olive oil','4 garlic cloves, minced','1 tsp dried oregano','Tzatziki: yogurt, cucumber, garlic, dill','Pita and salad to serve'],
    instructions:['Marinate chicken in lemon, olive oil, garlic, oregano, salt for 1 hour.','Thread onto skewers.','Grill or cook in a hot pan 10–12 minutes, turning, until cooked through and charred.','Serve in pita with tzatziki and salad.'] },

  { title:'Chicken & Rice Soup', description:'Healing, deeply flavoured chicken and rice soup — the ultimate cold-weather comfort.', category:'Chicken', emoji:'🍗', color:C, prep_time:10, cook_time:40, servings:6, contains:['meat'], tags:['chicken','soup','gf','comfort','family'],
    ingredients:['600g chicken thighs, bone-in','200g long-grain rice','2 carrots, diced','2 celery stalks, diced','1 onion, diced','3 garlic cloves','1.5L chicken stock','Fresh thyme, bay leaf, parsley'],
    instructions:['Simmer chicken in stock with onion, garlic, thyme, bay leaf for 25 minutes.','Remove chicken, shred. Discard skin and bones.','Add carrots, celery, rice to broth. Simmer 20 minutes.','Return chicken, season, finish with parsley.'] },

  { title:'Chicken Schnitzel', description:'Thin-pounded chicken breast in crispy breadcrumbs — Viennese classic done right.', category:'Chicken', emoji:'🍗', color:C, prep_time:20, cook_time:10, servings:4, contains:['meat','gluten','eggs','dairy'], tags:['chicken','austrian','fried','family'],
    ingredients:['4 chicken breasts, pounded thin','100g plain flour','2 eggs, beaten','150g breadcrumbs','100ml vegetable oil','Lemon wedges, parsley','Salt, pepper'],
    instructions:['Season chicken. Coat in flour, dip in egg, press into breadcrumbs.','Heat oil in a large pan over medium-high heat.','Fry chicken 3–4 minutes per side until deep golden. Work in batches.','Drain on paper towel. Serve immediately with lemon wedges.'] },

  { title:'Chicken Florentine', description:'Pan-seared chicken breast with creamy spinach and Parmesan sauce — restaurant-quality at home.', category:'Chicken', emoji:'🍗', color:C, prep_time:10, cook_time:20, servings:4, contains:['meat','dairy'], tags:['chicken','italian','cream','gf'],
    ingredients:['4 chicken breasts','200g baby spinach','150ml cream','60g Parmesan, grated','3 garlic cloves','100ml chicken stock','2 tbsp butter','Salt, pepper, nutmeg'],
    instructions:['Sear chicken 5–6 minutes per side. Remove.','Cook garlic in butter 1 minute. Add spinach, wilt.','Add cream, stock, Parmesan. Simmer 3 minutes.','Return chicken, spoon sauce over. Season with nutmeg and salt.'] },

  { title:'Chicken Lemongrass Stir-Fry', description:'Fragrant lemongrass, ginger, and chilli with chicken and Thai vegetables.', category:'Chicken', emoji:'🍗', color:C, prep_time:15, cook_time:12, servings:4, contains:['meat'], tags:['chicken','thai','stir-fry','gf','quick'],
    ingredients:['600g chicken breast, thinly sliced','2 lemongrass stalks, minced','3 garlic cloves','1 red chilli','1 tbsp fish sauce','1 tbsp soy sauce','1 tsp sugar','Snap peas, basil, oil, rice'],
    instructions:['Heat oil in wok over high heat. Stir-fry lemongrass, garlic, chilli 1 minute.','Add chicken, stir-fry 5–6 minutes until cooked through.','Add snap peas, fish sauce, soy sauce, sugar. Toss 2 minutes.','Finish with basil. Serve over rice.'] },

  { title:'Chicken Marsala', description:'Chicken in a Marsala wine and mushroom sauce — Italian-American comfort at its finest.', category:'Chicken', emoji:'🍗', color:C, prep_time:10, cook_time:25, servings:4, contains:['meat','gluten','dairy'], tags:['chicken','italian','mushroom','marsala'],
    ingredients:['4 chicken breasts, pounded','60g plain flour','300g mushrooms, sliced','150ml Marsala wine','150ml chicken stock','3 tbsp butter','2 tbsp olive oil','Thyme, parsley'],
    instructions:['Dredge chicken in flour. Sear in oil+butter 3 minutes per side. Remove.','Fry mushrooms until golden. Add Marsala, reduce 2 minutes.','Add stock, simmer 5 minutes. Swirl in butter.','Return chicken, spoon sauce over. Garnish with thyme.'] },

  { title:'Tandoori Chicken', description:'Chicken marinated in spiced yogurt and roasted until charred and aromatic — classic Indian.', category:'Chicken', emoji:'🍗', color:C, prep_time:15, cook_time:30, servings:4, contains:['meat','dairy'], tags:['chicken','indian','gf','marinated'],
    ingredients:['8 chicken pieces, skin scored','150g full-fat yogurt','2 tbsp tandoori masala','1 tsp turmeric','Juice of 1 lemon','4 garlic cloves, minced','1 tsp ginger','Salt, fresh coriander, lemon wedges'],
    instructions:['Mix yogurt, spices, lemon, garlic, ginger. Rub into scored chicken.','Marinate minimum 2 hours, ideally overnight.','Roast at 240°C for 25–30 minutes until charred and cooked through.','Serve with naan, coriander, lemon wedges.'] },

  // ── FISH / SEAFOOD (25) ───────────────────────────────────────────────────
  { title:'Miso Glazed Salmon', description:'A 4-ingredient glaze that caramelises into something extraordinary — under 20 minutes.', category:'Fish', emoji:'🐟', color:F, prep_time:5, cook_time:12, servings:4, contains:['fish'], tags:['salmon','miso','quick','gf'],
    ingredients:['4 salmon fillets','3 tbsp white miso','2 tbsp mirin','1 tbsp soy sauce','1 tbsp honey','Sesame seeds, scallions'],
    instructions:['Mix miso, mirin, soy sauce, honey.','Coat salmon generously. Marinate 10 minutes.','Broil skin-side down 8–10 minutes until glaze caramelises.','Scatter sesame seeds and scallions.'] },

  { title:'Shrimp Scampi', description:'Butter, white wine, garlic, lemon, and shrimp over linguine — 15-minute perfection.', category:'Fish', emoji:'🐟', color:F, prep_time:5, cook_time:15, servings:4, contains:['shellfish','gluten','dairy'], tags:['shrimp','pasta','quick','italian'],
    ingredients:['400g linguine','500g large shrimp, peeled','5 garlic cloves, sliced','100ml dry white wine','4 tbsp unsalted butter','2 tbsp olive oil','Juice of 1 lemon','Parsley, chilli flakes'],
    instructions:['Cook linguine. Sauté shrimp in oil 1–2 mins per side. Remove.','Cook garlic, add wine, reduce 2 mins. Add butter.','Add pasta, shrimp, lemon, pasta water. Toss vigorously.','Season, top with parsley and chilli flakes.'] },

  { title:'Pan-Seared Cod with Lemon Butter', description:'Flaky cod with a golden crust in a simple lemon butter sauce — the most elegant 15-minute dinner.', category:'Fish', emoji:'🐟', color:F, prep_time:5, cook_time:12, servings:4, contains:['fish','dairy'], tags:['cod','fish','quick','gf','lemon'],
    ingredients:['4 cod fillets','4 tbsp butter','3 garlic cloves, minced','Juice of 1 lemon','2 tbsp capers','2 tbsp olive oil','Fresh parsley, salt, pepper'],
    instructions:['Pat fish dry, season generously.','Sear in oil over medium-high 3–4 minutes until golden. Flip, cook 2 more minutes. Remove.','In same pan, melt butter, add garlic, cook 1 minute. Add lemon juice and capers.','Spoon sauce over fish. Garnish with parsley.'] },

  { title:'Salmon with Dill & Lemon', description:'Classic baked salmon with dill, lemon, and a touch of butter — simple and always impressive.', category:'Fish', emoji:'🐟', color:F, prep_time:5, cook_time:15, servings:4, contains:['fish','dairy'], tags:['salmon','baked','gf','quick'],
    ingredients:['4 salmon fillets','3 tbsp butter, softened','2 tbsp fresh dill, chopped','Zest and juice of 1 lemon','2 garlic cloves, minced','Salt, pepper, lemon slices'],
    instructions:['Mix butter, dill, lemon zest, garlic.','Place salmon on a foil-lined tray. Top with herb butter and lemon slices.','Bake at 200°C for 12–15 minutes until just cooked through.','Squeeze lemon over and serve immediately.'] },

  { title:'Spicy Cajun Shrimp', description:'Bold, smoky Cajun-spiced shrimp — ready in 10 minutes, serve with rice or crusty bread.', category:'Fish', emoji:'🐟', color:F, prep_time:5, cook_time:10, servings:4, contains:['shellfish'], tags:['shrimp','cajun','quick','gf','spicy'],
    ingredients:['500g large shrimp, peeled','1 tbsp smoked paprika','1 tsp cayenne','1 tsp garlic powder','1 tsp onion powder','1 tsp dried oregano','3 tbsp butter','Salt, lemon, parsley'],
    instructions:['Toss shrimp with all spices and salt.','Melt butter in a hot pan. Add shrimp in a single layer.','Cook 1–2 minutes per side until pink and cooked through.','Squeeze lemon over, scatter parsley. Serve immediately.'] },

  { title:'Tuna Poke Bowl', description:'Sushi-grade tuna with soy-sesame marinade, pickled veg, and rice — Hawaiian in a bowl.', category:'Fish', emoji:'🐟', color:F, prep_time:20, cook_time:0, servings:4, contains:['fish'], tags:['tuna','poke','bowl','gf','no-cook'],
    ingredients:['400g sushi-grade tuna, diced','3 tbsp soy sauce','1 tsp sesame oil','1 tsp rice vinegar','1 tsp sriracha','Cooked rice, edamame, cucumber, avocado','Sesame seeds, pickled ginger, nori'],
    instructions:['Marinate tuna in soy sauce, sesame oil, vinegar, sriracha for 10 minutes.','Prepare bowl bases with rice.','Arrange tuna, edamame, cucumber, avocado over rice.','Top with sesame seeds, pickled ginger, and nori strips.'] },

  { title:'Thai Fish Curry', description:'Silky coconut milk curry with flaky white fish and fragrant Thai aromatics.', category:'Fish', emoji:'🐟', color:F, prep_time:10, cook_time:20, servings:4, contains:['fish'], tags:['fish','thai','curry','gf'],
    ingredients:['600g white fish (cod or sea bass), chunked','400ml coconut milk','2 tbsp red curry paste','200ml fish or vegetable stock','1 tbsp fish sauce','1 lime, juiced','Bok choy, Thai basil, rice to serve'],
    instructions:['Fry curry paste in oil 1 minute. Add coconut milk and stock — simmer 5 minutes.','Add fish sauce and lime juice. Taste and adjust.','Add fish pieces. Simmer 8–10 minutes until just cooked through.','Add bok choy. Serve with rice and Thai basil.'] },

  { title:'Garlic Butter Shrimp', description:'The simplest, most addictive shrimp — garlic, butter, parsley, done.', category:'Fish', emoji:'🐟', color:F, prep_time:5, cook_time:8, servings:4, contains:['shellfish','dairy'], tags:['shrimp','quick','gf','garlic','butter'],
    ingredients:['600g large shrimp, peeled','5 garlic cloves, thinly sliced','4 tbsp unsalted butter','Juice of ½ lemon','Pinch of red pepper flakes','Fresh parsley','Salt, pepper'],
    instructions:['Heat butter in a large skillet over medium-high.','Add garlic, cook 1 minute until golden (not brown).','Add shrimp in single layer. Cook 1–2 minutes per side.','Deglaze with lemon juice, add parsley and chilli flakes. Serve immediately.'] },

  { title:'Mediterranean Baked Halibut', description:'Flaky halibut on a bed of tomatoes, olives, and capers — a 25-minute Mediterranean meal.', category:'Fish', emoji:'🐟', color:F, prep_time:10, cook_time:20, servings:4, contains:['fish'], tags:['halibut','fish','mediterranean','gf','baked'],
    ingredients:['4 halibut fillets','300g cherry tomatoes, halved','80g kalamata olives','3 tbsp capers','4 garlic cloves, sliced','4 tbsp olive oil','1 tsp dried oregano','Fresh basil, salt, pepper'],
    instructions:['In a baking dish, combine tomatoes, olives, capers, garlic, olive oil, oregano.','Place halibut on top. Season generously.','Bake at 200°C for 18–20 minutes until fish flakes easily.','Top with fresh basil. Serve with crusty bread.'] },

  { title:'Salmon Teriyaki', description:'Lacquered salmon in a homemade teriyaki glaze — better than your favourite Japanese restaurant.', category:'Fish', emoji:'🐟', color:F, prep_time:5, cook_time:12, servings:4, contains:['fish'], tags:['salmon','teriyaki','japanese','gf','quick'],
    ingredients:['4 salmon fillets','3 tbsp soy sauce','2 tbsp mirin','1 tbsp sake or rice wine','1 tbsp sugar','1 tsp sesame oil','Sesame seeds, rice, steamed broccoli'],
    instructions:['Mix soy sauce, mirin, sake, sugar, sesame oil.','Heat a pan over medium-high. Sear salmon skin-side down 4 minutes.','Flip. Add teriyaki sauce. Cook 3 minutes, basting constantly, until glazed.','Serve over rice with broccoli. Scatter sesame seeds.'] },

  { title:'Seared Tuna with Sesame Crust', description:'Rare tuna encrusted in sesame seeds, sliced to show the perfect pink centre.', category:'Fish', emoji:'🐟', color:F, prep_time:10, cook_time:5, servings:4, contains:['fish'], tags:['tuna','seared','gf','elegant','quick'],
    ingredients:['4 tuna steaks','4 tbsp black and white sesame seeds','2 tbsp soy sauce','1 tsp wasabi','1 tsp sesame oil','Pickled ginger, micro greens','1 tbsp vegetable oil'],
    instructions:['Press sesame seeds firmly onto all sides of tuna steaks.','Heat oil in pan over very high heat until smoking.','Sear tuna 45–60 seconds per side — the centre should stay rare.','Slice thickly. Serve with soy-wasabi dipping sauce.'] },

  { title:'Fish Tacos', description:'Crispy beer-battered fish, cool slaw, and chipotle mayo in warm corn tortillas.', category:'Fish', emoji:'🐟', color:F, prep_time:20, cook_time:15, servings:4, contains:['fish','gluten'], tags:['fish','tacos','mexican','fried'],
    ingredients:['600g white fish, cut into strips','150g plain flour','200ml light beer','1 tsp cumin','Corn tortillas','Chipotle mayo: mayo, chipotle, lime','Slaw: cabbage, lime, coriander','Oil for frying'],
    instructions:['Make batter: whisk flour, beer, cumin, salt.','Dip fish in batter, fry in hot oil 3–4 minutes until golden. Drain.','Char tortillas on a flame.','Assemble with fish, chipotle mayo, and slaw.'] },

  { title:'Prawn Pad Thai', description:'The iconic Thai stir-fried noodle dish — sweet, salty, tangy, and endlessly satisfying.', category:'Fish', emoji:'🐟', color:F, prep_time:15, cook_time:15, servings:4, contains:['shellfish','gluten','eggs'], tags:['prawn','noodles','thai','classic'],
    ingredients:['300g rice noodles','400g prawns, peeled','3 eggs','3 tbsp fish sauce','2 tbsp tamarind paste','1 tbsp sugar','3 garlic cloves','Bean sprouts, scallions, peanuts, lime'],
    instructions:['Soak noodles in hot water 10 minutes. Mix fish sauce, tamarind, sugar.','Stir-fry prawns in oil over high heat 2 minutes. Remove.','Add garlic, noodles, sauce — toss 2 minutes. Push aside, scramble eggs.','Mix together, add prawns, bean sprouts, scallions. Top with peanuts and lime.'] },

  { title:'Clam Chowder', description:'Thick, creamy New England clam chowder with potatoes and smoky bacon — the classic.', category:'Fish', emoji:'🐟', color:F, prep_time:15, cook_time:30, servings:4, contains:['shellfish','dairy','gluten','meat'], tags:['clam','soup','american','chowder'],
    ingredients:['2 cans clams, juice reserved','200g bacon, diced','3 potatoes, diced','1 onion, diced','2 celery stalks','2 tbsp flour','500ml whole milk','200ml cream, fresh thyme, parsley'],
    instructions:['Fry bacon until crisp. Remove, leaving fat.','Sauté onion and celery 5 minutes. Add flour, stir 2 minutes.','Add clam juice, potatoes, thyme. Simmer 15 minutes.','Add milk, cream, clams, bacon. Heat gently — do not boil. Finish with parsley.'] },

  { title:'Bouillabaisse', description:'The great Provençal fish stew — saffron broth, mixed seafood, and rouille on toasted bread.', category:'Fish', emoji:'🐟', color:F, prep_time:20, cook_time:35, servings:4, contains:['fish','shellfish','gluten','dairy'], tags:['fish','french','stew','elegant'],
    ingredients:['400g mixed fish fillets','200g mussels, cleaned','200g prawns','1 fennel bulb, diced','1 onion, diced','4 tomatoes, chopped','Pinch of saffron','500ml fish stock, white wine, baguette, rouille'],
    instructions:['Sauté onion and fennel in olive oil 8 minutes. Add saffron, tomatoes, wine — simmer 10 minutes.','Add fish stock. Bring to a boil.','Add seafood in order of cooking time — firm fish first, prawns and mussels last. 10 minutes total.','Serve in deep bowls with toasted baguette and rouille.'] },

  { title:'Spicy Tuna Roll (Deconstructed)', description:'All the flavours of a spicy tuna roll in a bowl — no rolling required.', category:'Fish', emoji:'🐟', color:F, prep_time:20, cook_time:5, servings:4, contains:['fish'], tags:['tuna','japanese','bowl','gf'],
    ingredients:['400g sushi-grade tuna, diced fine','2 tbsp sriracha mayo','1 tbsp soy sauce','1 tsp sesame oil','Cooked sushi rice','1 cucumber, diced','Avocado, nori, pickled ginger, sesame seeds'],
    instructions:['Mix tuna with sriracha mayo, soy sauce, sesame oil.','Mould sushi rice into bowls or press into a glass.','Layer with spicy tuna, cucumber, avocado.','Top with nori, pickled ginger, sesame seeds.'] },

  { title:'Lemon Herb Baked Trout', description:'Whole trout baked with lemon, herbs, and garlic — elegant simplicity in 25 minutes.', category:'Fish', emoji:'🐟', color:F, prep_time:10, cook_time:20, servings:4, contains:['fish'], tags:['trout','fish','baked','gf','quick'],
    ingredients:['2 whole rainbow trout, cleaned','2 lemons, sliced','4 garlic cloves, smashed','Fresh thyme and parsley sprigs','3 tbsp olive oil','Salt, pepper','Capers for serving'],
    instructions:['Score both sides of fish. Season inside and out.','Stuff cavities with lemon slices, garlic, herb sprigs.','Drizzle with olive oil. Roast at 200°C for 18–20 minutes.','Serve with capers and extra lemon.'] },

  { title:'Crab Cakes', description:'Golden, crispy crab cakes with a sweet, fresh interior and remoulade sauce.', category:'Fish', emoji:'🐟', color:F, prep_time:20, cook_time:12, servings:4, contains:['shellfish','gluten','eggs','dairy'], tags:['crab','seafood','american','elegant'],
    ingredients:['500g white crab meat','60g breadcrumbs','1 egg','2 tbsp mayo','1 tbsp Dijon mustard','1 tbsp Old Bay seasoning','2 scallions, minced','Remoulade: mayo, capers, lemon, hot sauce'],
    instructions:['Mix crab, breadcrumbs, egg, mayo, mustard, Old Bay, scallions gently.','Form into 8 patties. Chill 30 minutes.','Fry in butter and oil 3–4 minutes per side until golden.','Serve with remoulade sauce and lemon wedges.'] },

  { title:'Seafood Paella', description:'Golden saffron rice loaded with prawns, mussels, and squid — the centrepiece of any gathering.', category:'Fish', emoji:'🐟', color:F, prep_time:20, cook_time:35, servings:6, contains:['shellfish','fish'], tags:['seafood','paella','spanish','gf'],
    ingredients:['400g paella rice','300g prawns','300g mussels','200g squid rings','1 onion, 4 garlic, 2 tomatoes diced','Pinch of saffron','1L fish stock','100ml white wine, olive oil, smoked paprika, parsley'],
    instructions:['Soften onion and garlic. Add paprika, tomatoes, cook 5 minutes.','Add rice, toast 2 minutes. Add wine, saffron, stock.','Arrange seafood on top. Cook undisturbed 20 minutes until rice is done.','Rest 5 minutes (don\'t stir!). Scatter parsley.'] },

  { title:'Salmon Niçoise', description:'Classic Niçoise salad elevated with seared salmon — a whole meal in a bowl.', category:'Fish', emoji:'🐟', color:F, prep_time:20, cook_time:15, servings:4, contains:['fish','eggs'], tags:['salmon','salad','french','gf'],
    ingredients:['4 salmon fillets','4 eggs','200g green beans, blanched','200g cherry tomatoes','80g olives','4 potatoes, cooked and halved','Anchovies, capers','Dressing: olive oil, lemon, Dijon, garlic'],
    instructions:['Sear salmon 3–4 minutes per side. Soft-boil eggs 6 minutes.','Make dressing: whisk olive oil, lemon, mustard, garlic.','Arrange beans, tomatoes, olives, potatoes on plates.','Top with salmon and halved eggs. Drizzle dressing over everything.'] },

  { title:'Prawn Curry', description:'Plump prawns in a quick, fragrant coconut and tomato curry — ready in 25 minutes.', category:'Fish', emoji:'🐟', color:F, prep_time:10, cook_time:20, servings:4, contains:['shellfish'], tags:['prawn','curry','indian','gf','quick'],
    ingredients:['500g large prawns, peeled','1 can coconut milk','1 can diced tomatoes','1 onion, diced','4 garlic cloves, 1 tsp ginger','2 tsp curry powder','1 tsp turmeric','Coriander, lime, rice'],
    instructions:['Sauté onion in oil 5 minutes. Add garlic, ginger, spices — 2 minutes.','Add tomatoes and coconut milk. Simmer 12 minutes.','Add prawns, cook 4–5 minutes until pink and curled.','Finish with coriander and lime. Serve with rice.'] },

  { title:'Smoked Salmon Pasta', description:'Elegant yet effortless — smoked salmon, cream, capers, and dill over linguine.', category:'Fish', emoji:'🐟', color:F, prep_time:5, cook_time:15, servings:4, contains:['fish','gluten','dairy'], tags:['salmon','pasta','quick','elegant'],
    ingredients:['400g linguine','200g smoked salmon, torn','150ml crème fraîche','3 tbsp capers','Juice of ½ lemon','2 tbsp fresh dill','1 shallot, minced','Salt, black pepper'],
    instructions:['Cook pasta, reserve ½ cup pasta water.','Gently warm crème fraîche with shallot — don\'t boil.','Toss with drained pasta, adding pasta water to loosen.','Remove from heat. Add smoked salmon, capers, dill, lemon.'] },

  { title:'Swordfish Steaks with Salsa Verde', description:'Meaty swordfish steaks topped with punchy Italian herb sauce — grilled in minutes.', category:'Fish', emoji:'🐟', color:F, prep_time:15, cook_time:10, servings:4, contains:['fish'], tags:['swordfish','fish','gf','elegant','grill'],
    ingredients:['4 swordfish steaks','3 tbsp olive oil','Salsa verde: 1 bunch parsley, 1 bunch basil, 2 anchovy fillets, 1 garlic, 2 tbsp capers, 3 tbsp olive oil, 1 tsp lemon juice','Salt, pepper'],
    instructions:['Blitz all salsa verde ingredients until smooth but textured.','Brush swordfish with olive oil. Season well.','Grill or cook in a griddle pan 3–4 minutes per side.','Serve immediately topped with salsa verde.'] },

  // ── BEEF (20) ──────────────────────────────────────────────────────────────
  { title:'Korean Beef Rice Bowl', description:'Sweet, savory, spicy ground beef over rice with a fried egg — 20-minute dinner that never gets old.', category:'Beef', emoji:'🥩', color:B, prep_time:5, cook_time:15, servings:4, contains:['meat','eggs'], tags:['beef','korean','bowl','quick','gf'],
    ingredients:['500g ground beef','4 garlic cloves, minced','1 tbsp ginger','3 tbsp soy sauce','2 tbsp brown sugar','1 tbsp sesame oil','1 tsp gochujang','Rice, fried eggs, sesame seeds, scallions'],
    instructions:['Brown beef over high heat, breaking apart. Drain fat.','Add garlic and ginger, cook 1 minute.','Add sauce mixture, toss 2 minutes until caramelised.','Serve over rice with fried egg, sesame seeds, scallions.'] },

  { title:'Classic Beef Tacos', description:'Properly seasoned ground beef, quick-pickled onions, and all the toppings — taco night done right.', category:'Beef', emoji:'🥩', color:B, prep_time:15, cook_time:15, servings:4, contains:['meat','dairy','gluten'], tags:['beef','tacos','mexican','family'],
    ingredients:['500g ground beef','1 tbsp chilli powder','1 tsp cumin','1 tsp garlic powder','Corn or flour tortillas','Sour cream, salsa, cheese, avocado','Pickled red onion: vinegar, sugar'],
    instructions:['Pickle onion in vinegar with sugar and salt 15 minutes.','Brown beef with spices over high heat 10 minutes.','Warm tortillas.','Assemble with beef and all toppings.'] },

  { title:'Sunday Beef Bolognese', description:'A slow-simmered ragu that fills the house with the best smell — freezes perfectly.', category:'Beef', emoji:'🥩', color:B, prep_time:20, cook_time:120, servings:6, contains:['meat','pork','gluten','dairy'], tags:['beef','pasta','bolognese','slow-cook'],
    ingredients:['500g ground beef','150g pancetta, diced','1 onion, 2 carrots, 2 celery stalks, finely diced','4 garlic cloves','150ml milk, 150ml white wine','2 cans crushed tomatoes','Tagliatelle, Parmesan'],
    instructions:['Cook pancetta. Add vegetables, cook 10 minutes. Add beef.','Add milk, simmer until absorbed. Add wine, simmer until absorbed.','Add tomatoes. Simmer 1.5–2 hours on lowest heat.','Toss with pasta and lots of Parmesan.'] },

  { title:'Steak with Chimichurri', description:'Perfectly seared steak with herbaceous Argentinian chimichurri sauce — the definitive combination.', category:'Beef', emoji:'🥩', color:B, prep_time:15, cook_time:10, servings:4, contains:['meat'], tags:['steak','beef','gf','grill','argentinian'],
    ingredients:['4 sirloin or ribeye steaks','Chimichurri: 1 bunch parsley, 4 garlic, 1 tsp cumin, ½ tsp chilli, 4 tbsp olive oil, 2 tbsp red wine vinegar','Salt, coarse black pepper'],
    instructions:['Blitz chimichurri ingredients until rough sauce. Season, let sit 20 minutes.','Take steaks to room temperature. Season very generously with salt and pepper.','Sear in very hot pan or grill 2–4 minutes per side depending on thickness.','Rest 5 minutes. Serve with chimichurri spooned over.'] },

  { title:'Beef & Broccoli', description:'Tender beef strips with broccoli in a glossy, umami-packed sauce — better than takeout.', category:'Beef', emoji:'🥩', color:B, prep_time:15, cook_time:12, servings:4, contains:['meat'], tags:['beef','stir-fry','chinese','quick','gf'],
    ingredients:['500g flank or sirloin, thinly sliced','1 large head broccoli, cut into florets','4 garlic cloves, minced','3 tbsp soy sauce','1 tbsp oyster sauce','1 tbsp cornstarch (in 100ml water)','1 tsp sesame oil','Oil for cooking, rice to serve'],
    instructions:['Marinate beef in 1 tbsp soy sauce and cornstarch 10 minutes.','Blanch broccoli 2 minutes, drain.','Stir-fry beef in batches over very high heat 2 minutes. Remove.','Fry garlic, add broccoli, remaining sauce. Return beef, toss. Add cornstarch mixture, stir until glossy.'] },

  { title:'Beef Burger', description:'A proper pub-style beef burger with all the classic toppings — juicy and unforgettable.', category:'Beef', emoji:'🥩', color:B, prep_time:15, cook_time:12, servings:4, contains:['meat','gluten','dairy'], tags:['beef','burger','american','family','classic'],
    ingredients:['600g ground beef (80/20 fat)','4 brioche buns','4 slices cheddar','Lettuce, tomato, pickles, red onion','Special sauce: mayo, ketchup, mustard, pickle relish','Salt, pepper, oil'],
    instructions:['Divide beef into 4 patties. Season generously. Make a dimple in centre.','Cook in a hot cast-iron pan or grill 3–4 minutes per side. Add cheese last minute.','Toast buns, spread with special sauce.','Stack with all toppings.'] },

  { title:'Vietnamese Beef Pho', description:'Clear, aromatic beef broth with rice noodles — warming, restorative, and deeply flavoured.', category:'Beef', emoji:'🥩', color:B, prep_time:20, cook_time:30, servings:4, contains:['meat'], tags:['beef','soup','vietnamese','gf','noodles'],
    ingredients:['400g beef sirloin, paper-thin sliced','1.5L beef stock','1 cinnamon stick, 3 star anise','1 tbsp fish sauce','Rice noodles','Bean sprouts, basil, mint, lime','Sriracha, hoisin to serve'],
    instructions:['Simmer stock with cinnamon, star anise 20 minutes. Season with fish sauce.','Cook noodles per packet.','Divide noodles into bowls, lay raw beef slices on top.','Ladle boiling hot broth over (this cooks the beef). Serve with herbs and condiments.'] },

  { title:'Beef Rendang', description:'Slow-cooked Indonesian dry curry — complex, deeply spiced, and utterly magnificent.', category:'Beef', emoji:'🥩', color:B, prep_time:20, cook_time:90, servings:4, contains:['meat'], tags:['beef','indonesian','curry','gf','slow-cook'],
    ingredients:['800g beef chuck, cubed','400ml coconut milk','4 lemongrass stalks, minced','4 garlic cloves','1 onion, diced','2 tsp galangal or ginger','2 tbsp rendang paste','1 tsp turmeric, kaffir lime leaves, rice'],
    instructions:['Blend aromatics into a paste. Fry in oil 5 minutes until fragrant.','Add beef, brown on all sides.','Add coconut milk, rendang paste, turmeric, kaffir lime leaves.','Simmer 1.5 hours, stirring occasionally, until sauce is dry and meat is very tender.'] },

  { title:'Classic Meatballs in Tomato Sauce', description:'Tender beef meatballs slowly simmered in a rich tomato sauce — serve with pasta or in a hero roll.', category:'Beef', emoji:'🥩', color:B, prep_time:20, cook_time:35, servings:4, contains:['meat','gluten','eggs','dairy'], tags:['beef','italian','pasta','comfort'],
    ingredients:['500g ground beef','50g breadcrumbs soaked in 50ml milk','1 egg','60g Parmesan, grated','4 garlic cloves, minced','1 tsp dried oregano','700ml passata','Olive oil, basil'],
    instructions:['Mix beef, breadcrumbs, egg, Parmesan, 2 garlic cloves, oregano. Roll into 20 balls.','Brown meatballs in olive oil all over. Remove.','Fry remaining garlic 1 minute. Add passata, season, simmer 5 minutes.','Add meatballs, simmer 25 minutes. Finish with basil.'] },

  { title:'Chilli con Carne', description:'Rich, smoky beef and bean chilli — the perfect weeknight pot that only gets better the next day.', category:'Beef', emoji:'🥩', color:B, prep_time:15, cook_time:45, servings:6, contains:['meat'], tags:['beef','chilli','mexican','gf','meal-prep'],
    ingredients:['600g ground beef','2 cans kidney beans','1 can crushed tomatoes','1 onion, 4 garlic cloves','2 tsp chilli powder','1 tsp cumin','1 tsp smoked paprika','Sour cream, cheddar, coriander to serve'],
    instructions:['Brown beef, breaking apart. Remove excess fat.','Sauté onion and garlic 5 minutes. Add spices.','Return beef. Add tomatoes and beans. Simmer 35 minutes.','Adjust seasoning. Serve with sour cream, cheese, and coriander.'] },

  { title:'Braised Beef Short Ribs', description:'Meltingly tender short ribs braised in red wine until falling off the bone.', category:'Beef', emoji:'🥩', color:B, prep_time:20, cook_time:180, servings:4, contains:['meat','dairy'], tags:['beef','braised','slow-cook','elegant','weekend'],
    ingredients:['4 beef short ribs (bone-in)','1 bottle red wine','2 onions, 3 carrots, 3 celery, 4 garlic','500ml beef stock','2 tbsp tomato paste','Fresh thyme, bay leaves','2 tbsp oil, salt, pepper'],
    instructions:['Season ribs generously. Brown in batches in a Dutch oven.','Sauté vegetables 10 minutes. Add garlic, tomato paste.','Add wine and stock. Return ribs. Braise in oven at 160°C for 3 hours.','Remove ribs, reduce sauce. Serve ribs with sauce over mashed potato.'] },

  { title:'Steak Frites', description:'Pan-seared steak with crispy fries and a classic peppercorn sauce.', category:'Beef', emoji:'🥩', color:B, prep_time:15, cook_time:30, servings:2, contains:['meat','dairy'], tags:['steak','beef','french','fries','classic'],
    ingredients:['2 ribeye steaks','4 large potatoes','1 tbsp black peppercorns, crushed','100ml brandy','200ml beef stock','100ml cream','2 tbsp butter','Oil, salt'],
    instructions:['Fry thick-cut potato fries at 190°C for 15 minutes until golden.','Season steak generously. Sear in very hot pan 2–4 minutes per side. Rest.','For sauce: fry peppercorns in pan, add brandy, flambé. Add stock and cream, reduce by half.','Serve steak with frites and peppercorn sauce.'] },

  { title:'Cottage Pie', description:'Savoury ground beef in gravy topped with creamy mashed potato — the ultimate British comfort food.', category:'Beef', emoji:'🥩', color:B, prep_time:20, cook_time:40, servings:6, contains:['meat','dairy'], tags:['beef','comfort','british','family'],
    ingredients:['600g ground beef','1 onion, 2 carrots, 2 celery stalks, diced','3 garlic cloves','200ml beef stock','2 tbsp Worcestershire sauce','1 can crushed tomatoes','Mash: 1kg potato, butter, milk, Parmesan'],
    instructions:['Brown beef. Remove. Sauté vegetables 8 minutes. Return beef.','Add stock, Worcestershire, tomatoes. Simmer 20 minutes. Season well.','Make mashed potato with butter and milk.','Layer beef in dish, top with mash. Bake at 200°C for 20 minutes.'] },

  { title:'Philly Cheesesteak', description:'Thin-shaved ribeye with sautéed peppers, onions, and melted provolone in a hoagie roll.', category:'Beef', emoji:'🥩', color:B, prep_time:15, cook_time:15, servings:4, contains:['meat','gluten','dairy'], tags:['beef','american','sandwich','indulgent'],
    ingredients:['500g ribeye, paper-thin sliced (freeze first)','2 green peppers, sliced','1 large onion, sliced','200g provolone, sliced','4 hoagie rolls','2 tbsp butter, salt, pepper, Worcestershire'],
    instructions:['Cook peppers and onion in butter until soft and slightly caramelised, 10 minutes.','Add beef, cook on high heat 3–4 minutes, season with Worcestershire.','Layer beef and vegetables in rolls, top with provolone.','Return to pan or oven briefly until cheese melts.'] },

  // ── PORK (15) ──────────────────────────────────────────────────────────────
  { title:'Honey Mustard Pork Tenderloin', description:'Juicy pork tenderloin with a golden honey-mustard crust — elegant and quick.', category:'Pork', emoji:'🐷', color:K, prep_time:10, cook_time:25, servings:4, contains:['meat','pork'], tags:['pork','tenderloin','quick','gf'],
    ingredients:['2 pork tenderloins (500g each)','3 tbsp Dijon mustard','2 tbsp whole grain mustard','2 tbsp honey','3 garlic cloves, minced','1 tbsp oil, fresh thyme, salt, pepper'],
    instructions:['Sear tenderloins in oil 2 minutes per side.','Brush generously with mustard-honey glaze.','Roast at 200°C for 15–18 minutes until internal temp reaches 145°F.','Rest 5 minutes, slice thickly.'] },

  { title:'Sheet Pan Sausage & Vegetables', description:'Everything on one pan — crispy sausages, caramelised vegetables, almost zero clean-up.', category:'Pork', emoji:'🐷', color:K, prep_time:10, cook_time:35, servings:4, contains:['meat','pork'], tags:['pork','sausage','sheet-pan','easy','gf'],
    ingredients:['8 pork sausages','2 bell peppers, chunked','1 red onion, wedged','2 courgettes, chunked','Cherry tomatoes','3 tbsp olive oil','1 tsp dried herbs, fennel seeds, salt, pepper'],
    instructions:['Toss vegetables with oil, herbs, season. Spread on large sheet pan.','Nestle sausages among vegetables.','Roast at 220°C for 30–35 minutes, turning once, until golden.','Serve straight from the pan.'] },

  { title:'Pasta all\'Amatriciana', description:'Guanciale, tomatoes, and Pecorino — this Roman classic needs very few ingredients.', category:'Pork', emoji:'🐷', color:K, prep_time:10, cook_time:25, servings:4, contains:['meat','pork','gluten','dairy'], tags:['pork','pasta','italian','classic'],
    ingredients:['400g rigatoni','200g guanciale or pancetta, diced','1 can San Marzano tomatoes, crushed','1 dried chilli','100ml dry white wine','80g Pecorino Romano, grated','Black pepper'],
    instructions:['Render guanciale until crispy. Add chilli.','Add wine, reduce. Add tomatoes, simmer 15 minutes.','Cook pasta to al dente, reserve pasta water.','Toss pasta in sauce with Pecorino and black pepper.'] },

  { title:'Pulled Pork Tacos', description:'Slow-cooked pork shoulder shredded and piled into tortillas with pickled jalapeños.', category:'Pork', emoji:'🐷', color:K, prep_time:15, cook_time:240, servings:8, contains:['meat','pork','gluten'], tags:['pork','tacos','slow-cook','weekend','crowd'],
    ingredients:['1.5kg pork shoulder','2 tsp cumin, 2 tsp smoked paprika, 1 tsp chilli powder','4 garlic cloves','200ml apple cider vinegar','Tortillas, pickled jalapeños, slaw, coriander'],
    instructions:['Rub pork with spices, garlic, salt. Place in a Dutch oven with vinegar and ½ cup water.','Braise covered at 150°C for 3.5–4 hours until falling apart.','Shred with forks. Reduce braising liquid to a glaze, toss with pork.','Serve in tortillas with slaw and jalapeños.'] },

  { title:'Char Siu Pork', description:'Cantonese BBQ pork with a lacquered honey-soy glaze — incredible over noodles or rice.', category:'Pork', emoji:'🐷', color:K, prep_time:15, cook_time:30, servings:4, contains:['meat','pork'], tags:['pork','chinese','bbq','gf'],
    ingredients:['700g pork shoulder or tenderloin','3 tbsp hoisin sauce','2 tbsp soy sauce','2 tbsp honey','1 tbsp rice wine','1 tsp five-spice','2 garlic cloves, minced','Red food colouring (optional)'],
    instructions:['Mix all marinade ingredients. Coat pork, marinate minimum 2 hours.','Roast at 220°C for 25 minutes, basting every 10 minutes.','Switch to grill/broil for last 3–5 minutes for caramelised edges.','Rest 5 minutes, slice on the diagonal.'] },

  { title:'Pork Belly Braised in Soy & Star Anise', description:'Meltingly tender pork belly slow-braised in a sweet soy broth — a Chinese Sunday roast.', category:'Pork', emoji:'🐷', color:K, prep_time:15, cook_time:90, servings:4, contains:['meat','pork'], tags:['pork','chinese','braised','slow-cook','gf'],
    ingredients:['800g pork belly, cut into thick pieces','4 tbsp soy sauce','2 tbsp dark soy sauce','3 tbsp Shaoxing rice wine','2 tbsp sugar','3 star anise','1 cinnamon stick','3 garlic cloves, 1 tsp ginger, scallions'],
    instructions:['Blanch pork belly in boiling water 5 minutes. Drain.','Brown in oil. Add soy sauces, wine, sugar, spices, 400ml water.','Braise covered at 160°C for 1.5 hours until very tender.','Reduce sauce over high heat. Serve with steamed rice and bok choy.'] },

  { title:'Pork Schnitzel', description:'Thin-pounded pork cutlets in a crispy golden crust — the Viennese classic.', category:'Pork', emoji:'🐷', color:K, prep_time:20, cook_time:12, servings:4, contains:['meat','pork','gluten','eggs'], tags:['pork','austrian','fried','classic'],
    ingredients:['4 pork loin chops, pounded thin','100g plain flour','2 eggs, beaten','150g fine breadcrumbs','100ml vegetable oil','Lemon wedges, parsley, salt, pepper'],
    instructions:['Pound pork to 5mm thick. Season.','Coat in flour, dip in egg, press into breadcrumbs.','Fry in generous oil 3–4 minutes per side until deep golden.','Drain briefly. Serve with lemon.'] },

  { title:'Pork Chops with Apple & Sage', description:'Pan-seared pork chops with a cider-apple and sage pan sauce — autumn on a plate.', category:'Pork', emoji:'🐷', color:K, prep_time:10, cook_time:20, servings:4, contains:['meat','pork'], tags:['pork','apple','autumn','gf'],
    ingredients:['4 thick pork chops','2 apples, cored and sliced','150ml apple cider or apple juice','3 garlic cloves','8 fresh sage leaves','2 tbsp butter, olive oil, salt, pepper'],
    instructions:['Sear chops in oil over high heat 3–4 minutes per side. Remove.','Fry garlic and sage in butter 1 minute. Add apples, cook 3 minutes.','Add cider, scrape up browned bits. Simmer 3 minutes.','Return chops. Spoon sauce over. Rest 3 minutes before serving.'] },

  { title:'Spicy Pork Noodles', description:'Dan-dan inspired spicy pork noodles with chilli oil and crushed peanuts — addictive.', category:'Pork', emoji:'🐷', color:K, prep_time:10, cook_time:15, servings:4, contains:['meat','pork','gluten','nuts'], tags:['pork','noodles','spicy','chinese','quick'],
    ingredients:['400g noodles','300g ground pork','3 tbsp chilli oil or sambal oelek','2 tbsp soy sauce','1 tbsp rice vinegar','3 garlic cloves, minced','Crushed peanuts, scallions, sesame seeds'],
    instructions:['Cook noodles. Brown pork in a wok over high heat.','Add garlic, chilli oil, soy sauce, vinegar. Toss.','Add noodles to pork, mix well over high heat 2 minutes.','Serve topped with peanuts, scallions, and sesame seeds.'] },

  { title:'Smoked Sausage & Bean Stew', description:'Smoky sausage, white beans, and greens in a hearty broth — ready in 30 minutes.', category:'Pork', emoji:'🐷', color:K, prep_time:10, cook_time:25, servings:4, contains:['meat','pork'], tags:['pork','sausage','stew','quick','gf'],
    ingredients:['400g smoked sausage (kielbasa or andouille), sliced','2 cans cannellini beans','1 can crushed tomatoes','1 onion, diced','4 garlic cloves','200g kale or spinach','500ml chicken stock','Paprika, chilli flakes, olive oil'],
    instructions:['Brown sausage slices in oil. Remove.','Sauté onion 5 minutes. Add garlic, paprika, chilli.','Add tomatoes, stock, beans. Simmer 15 minutes.','Return sausage. Add greens, stir until wilted. Season generously.'] },

  { title:'BLT Sandwich', description:'The perfect BLT — thick-cut bacon, ripe tomato, crunchy lettuce, good mayo on toasted sourdough.', category:'Pork', emoji:'🐷', color:K, prep_time:10, cook_time:10, servings:4, contains:['meat','pork','gluten','eggs'], tags:['pork','bacon','sandwich','classic','quick'],
    ingredients:['12 rashers thick-cut bacon','2 large ripe tomatoes, sliced','1 head romaine or butter lettuce','Good quality mayo','Sourdough bread','Salt, pepper'],
    instructions:['Cook bacon until crispy and golden.','Toast bread.','Spread mayo generously on both slices.','Build: lettuce, tomato (seasoned), bacon. Close and slice diagonally.'] },

  { title:'Pork Larb (Thai Minced Pork Salad)', description:'Fragrant minced pork salad with toasted rice, fresh herbs, and lime — fast, light, and bright.', category:'Pork', emoji:'🐷', color:K, prep_time:15, cook_time:10, servings:4, contains:['meat','pork'], tags:['pork','thai','salad','gf','quick'],
    ingredients:['500g ground pork','3 tbsp fish sauce','3 tbsp lime juice','2 tsp sugar','1 tsp toasted rice powder (dry-roast then grind)','4 shallots, thinly sliced','Mint, coriander, Thai basil','Chilli flakes, lettuce cups to serve'],
    instructions:['Cook pork in a dry pan over medium-high, breaking apart, until cooked through.','Remove from heat. Add fish sauce, lime juice, sugar.','Add shallots, herbs, rice powder, chilli flakes. Toss well.','Serve immediately in lettuce cups with extra lime.'] },

  { title:'Ham & Leek Pasta Bake', description:'Creamy pasta bake with ham, leeks, and melted cheese — classic family comfort food.', category:'Pork', emoji:'🐷', color:K, prep_time:15, cook_time:35, servings:6, contains:['meat','pork','gluten','dairy'], tags:['pork','pasta','baked','family','comfort'],
    ingredients:['400g pasta (penne)','200g ham, diced','2 leeks, sliced','500ml béchamel sauce (butter, flour, milk)','150g Gruyère or cheddar, grated','1 tsp Dijon mustard','Breadcrumbs for topping'],
    instructions:['Cook pasta. Sauté leeks in butter 8 minutes.','Mix pasta, leeks, ham with béchamel and half the cheese. Season with mustard.','Transfer to baking dish, top with remaining cheese and breadcrumbs.','Bake at 190°C for 20 minutes until golden and bubbling.'] },

  { title:'Pork & Ginger Dumplings (Gyoza)', description:'Pan-fried pork and ginger dumplings crispy on one side, tender on the other — a true crowd-pleaser.', category:'Pork', emoji:'🐷', color:K, prep_time:30, cook_time:15, servings:4, contains:['meat','pork','gluten'], tags:['pork','dumplings','japanese','gyoza'],
    ingredients:['30 gyoza wrappers','300g ground pork','2 tbsp soy sauce','1 tbsp sesame oil','2 garlic cloves, minced','1 tbsp ginger, grated','100g cabbage, finely shredded','Dipping sauce: soy, rice vinegar, sesame oil'],
    instructions:['Mix pork, soy sauce, sesame oil, garlic, ginger, cabbage.','Place 1 tsp filling in each wrapper. Fold and pleat to seal.','Fry flat-side down in oil 2–3 minutes until golden.','Add splash of water, cover, steam 3 minutes. Serve with dipping sauce.'] },
]
