import React, { useState, useCallback } from 'react';
import { Header } from './components/Header';
import { RecipeCard } from './components/RecipeCard';
import { GeneratedRecipeModal } from './components/GeneratedRecipeModal';
import { generateRecipe as generateRecipeWithOpenAI } from './services/openaiService';
import { generateRecipe as generateRecipeWithGemini } from './services/geminiService';
import type { Recipe, SearchFilters } from './types';
import { PREFERENCE_OPTIONS, DIFFICULTY_OPTIONS, DIET_OPTIONS } from './constants';
import { useTranslation } from './i18n';

const App: React.FC = () => {
  const { t, language } = useTranslation();
  const [ingredients, setIngredients] = useState<string>('');
  const [filters, setFilters] = useState<SearchFilters>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [generatedRecipe, setGeneratedRecipe] = useState<Recipe | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFilterChange = (type: keyof SearchFilters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [type]: prev[type] === value ? undefined : value,
    }));
  };

  const ERROR_MESSAGE_MAP: Record<string, Parameters<typeof t>[0]> = {
    API_QUOTA_EXCEEDED: 'error.quotaExceeded',
    API_INVALID_KEY: 'error.invalidKey',
    API_UNKNOWN_ERROR: 'error.unknown',
    GEMINI_API_KEY_MISSING: 'error.geminiKeyMissing',
    'error.invalidRecipeFormat': 'error.invalidRecipeFormat',
  };

  const handleGenerateClick = useCallback(async () => {
    if (!ingredients.trim()) {
      setError(t('error.noIngredients'));
      return;
    }
    setIsLoading(true);
    setError(null);
    setGeneratedRecipe(null);
    try {
      // 直接使用 Gemini API
      const recipe = await generateRecipeWithGemini(ingredients, filters, language);
      setGeneratedRecipe(recipe);
    } catch (err) {
      console.error(err);
      if (err instanceof Error) {
        const translationKey = ERROR_MESSAGE_MAP[err.message];
        if (translationKey) {
          setError(t(translationKey));
          return;
        }
        setError(err.message);
        return;
      }
      setError(t('error.unknown'));
    } finally {
      setIsLoading(false);
    }
  }, [ingredients, filters, t, language]);

  const closeModal = () => {
    setGeneratedRecipe(null);
    setError(null);
  }

  // 示例食谱数据
  const sampleRecipes: Record<string, Recipe> = {
    chicken: {
      recipeName: language === 'zh' ? '香煎鸡胸肉配时蔬' : 'Pan-Seared Chicken Breast with Vegetables',
      description: language === 'zh' ? '简单快速的健康低脂料理，完美的工作日晚餐选择' : 'A simple, quick, and healthy low-fat dish, perfect for a weekday dinner',
      prepTime: language === 'zh' ? '10分钟' : '10 minutes',
      cookTime: language === 'zh' ? '20分钟' : '20 minutes',
      servings: language === 'zh' ? '2人份' : '2 servings',
      ingredients: language === 'zh'
        ? ['鸡胸肉 300克', '西兰花 200克', '胡萝卜 1根', '橄榄油 2汤匙', '蒜末 2瓣', '盐 适量', '黑胡椒 适量', '柠檬汁 1汤匙']
        : ['Chicken breast 300g', 'Broccoli 200g', 'Carrot 1 piece', 'Olive oil 2 tbsp', 'Minced garlic 2 cloves', 'Salt to taste', 'Black pepper to taste', 'Lemon juice 1 tbsp'],
      steps: language === 'zh'
        ? ['将鸡胸肉用盐和黑胡椒腌制15分钟', '西兰花切小朵，胡萝卜切片', '热锅加橄榄油，煎鸡胸肉每面4-5分钟至金黄', '取出鸡肉，同锅加蒜末炒香', '加入蔬菜翻炒5分钟', '鸡肉切片摆盘，配上蔬菜', '淋上柠檬汁即可享用']
        : ['Marinate chicken breast with salt and pepper for 15 minutes', 'Cut broccoli into florets, slice carrots', 'Heat pan with olive oil, sear chicken 4-5 minutes each side until golden', 'Remove chicken, sauté garlic in same pan', 'Add vegetables and stir-fry for 5 minutes', 'Slice chicken and plate with vegetables', 'Drizzle with lemon juice and serve'],
      tags: language === 'zh' ? ['快手', '健康', '低脂'] : ['Quick', 'Healthy', 'Low-fat'],
      imageUrl: 'https://images.pexels.com/photos/2338407/pexels-photo-2338407.jpeg?auto=compress&cs=tinysrgb&w=800'
    },
    pasta: {
      recipeName: language === 'zh' ? '经典意式番茄罗勒意面' : 'Classic Italian Tomato Basil Pasta',
      description: language === 'zh' ? '传统意式风味，简单食材造就经典美味' : 'Traditional Italian flavor with simple ingredients',
      prepTime: language === 'zh' ? '5分钟' : '5 minutes',
      cookTime: language === 'zh' ? '15分钟' : '15 minutes',
      servings: language === 'zh' ? '2人份' : '2 servings',
      ingredients: language === 'zh'
        ? ['意大利面 200克', '番茄 4个', '新鲜罗勒 1把', '大蒜 3瓣', '橄榄油 3汤匙', '帕玛森芝士 适量', '盐 适量', '黑胡椒 适量']
        : ['Pasta 200g', 'Tomatoes 4 pieces', 'Fresh basil 1 bunch', 'Garlic 3 cloves', 'Olive oil 3 tbsp', 'Parmesan cheese to taste', 'Salt to taste', 'Black pepper to taste'],
      steps: language === 'zh'
        ? ['煮一锅盐水，煮意大利面至弹牙状态', '番茄切丁，大蒜切片，罗勒撕碎', '热锅加橄榄油，爆香蒜片', '加入番茄丁，中火煮10分钟', '加入煮好的意面翻炒均匀', '加入罗勒叶，调味', '装盘撒上帕玛森芝士']
        : ['Boil salted water and cook pasta al dente', 'Dice tomatoes, slice garlic, tear basil', 'Heat olive oil and sauté garlic', 'Add tomatoes and simmer for 10 minutes', 'Toss in cooked pasta', 'Add basil and season', 'Plate and top with Parmesan'],
      tags: language === 'zh' ? ['素食', '经典', '意式'] : ['Vegetarian', 'Classic', 'Italian'],
      imageUrl: 'https://images.pexels.com/photos/1437267/pexels-photo-1437267.jpeg?auto=compress&cs=tinysrgb&w=800'
    },
    salmon: {
      recipeName: language === 'zh' ? '香煎三文鱼配柠檬黄油' : 'Pan-Seared Salmon with Lemon Butter',
      description: language === 'zh' ? '富含Omega-3，美味又健康的海鲜佳肴' : 'Rich in Omega-3, delicious and healthy seafood dish',
      prepTime: language === 'zh' ? '5分钟' : '5 minutes',
      cookTime: language === 'zh' ? '12分钟' : '12 minutes',
      servings: language === 'zh' ? '2人份' : '2 servings',
      ingredients: language === 'zh'
        ? ['三文鱼 2块', '黄油 30克', '柠檬 1个', '新鲜莳萝 少许', '盐 适量', '黑胡椒 适量', '橄榄油 1汤匙']
        : ['Salmon fillets 2 pieces', 'Butter 30g', 'Lemon 1 piece', 'Fresh dill a pinch', 'Salt to taste', 'Black pepper to taste', 'Olive oil 1 tbsp'],
      steps: language === 'zh'
        ? ['三文鱼用盐和胡椒调味', '热锅加橄榄油，鱼皮面朝下煎4分钟', '翻面再煎3分钟', '取出三文鱼', '同锅加黄油融化，挤入柠檬汁', '加入莳萝，搅拌成酱汁', '将酱汁淋在三文鱼上即可']
        : ['Season salmon with salt and pepper', 'Heat oil, sear skin-side down for 4 minutes', 'Flip and cook for 3 more minutes', 'Remove salmon', 'Melt butter in pan, add lemon juice', 'Add dill and stir into sauce', 'Pour sauce over salmon'],
      tags: language === 'zh' ? ['低卡', '海鲜', '高蛋白'] : ['Low-cal', 'Seafood', 'High-protein'],
      imageUrl: 'https://images.pexels.com/photos/262959/pexels-photo-262959.jpeg?auto=compress&cs=tinysrgb&w=800'
    },
    soup: {
      recipeName: language === 'zh' ? '法式洋葱汤' : 'French Onion Soup',
      description: language === 'zh' ? '浓郁温暖的经典法式汤品，完美的冬日暖身选择' : 'Rich and warming classic French soup, perfect for winter',
      prepTime: language === 'zh' ? '15分钟' : '15 minutes',
      cookTime: language === 'zh' ? '45分钟' : '45 minutes',
      servings: language === 'zh' ? '4人份' : '4 servings',
      ingredients: language === 'zh'
        ? ['洋葱 6个', '黄油 50克', '牛肉高汤 1升', '白葡萄酒 100毫升', '法式面包 4片', '格鲁耶尔奶酪 200克', '百里香 2支', '盐 适量', '黑胡椒 适量']
        : ['Onions 6 pieces', 'Butter 50g', 'Beef broth 1L', 'White wine 100ml', 'French bread 4 slices', 'Gruyère cheese 200g', 'Thyme 2 sprigs', 'Salt to taste', 'Black pepper to taste'],
      steps: language === 'zh'
        ? ['洋葱切丝', '大锅融化黄油，加入洋葱', '小火慢炒30分钟至焦糖化', '倒入白葡萄酒，煮至挥发', '加入高汤和百里香，煮15分钟', '面包片烤至金黄，铺上奶酪', '汤盛入碗中，放上芝士面包', '放入烤箱烤至奶酪融化金黄']
        : ['Slice onions thinly', 'Melt butter in large pot, add onions', 'Cook low heat for 30 mins until caramelized', 'Add wine and cook until evaporated', 'Add broth and thyme, simmer 15 minutes', 'Toast bread, top with cheese', 'Pour soup into bowls, add cheese toast', 'Broil until cheese melts and browns'],
      tags: language === 'zh' ? ['舒适', '西式', '经典'] : ['Comfort', 'Western', 'Classic'],
      imageUrl: 'https://images.pexels.com/photos/539451/pexels-photo-539451.jpeg?auto=compress&cs=tinysrgb&w=800'
    }
  };

  const handleSampleRecipeClick = (recipeKey: string) => {
    setGeneratedRecipe(sampleRecipes[recipeKey]);
  }

  // 随机食材数据库
  const randomIngredientsPool = language === 'zh'
    ? [
        ['鸡蛋', '番茄', '葱'],
        ['土豆', '牛肉', '洋葱'],
        ['三文鱼', '柠檬', '黄油'],
        ['意大利面', '罗勒', '大蒜'],
        ['鸡胸肉', '西兰花', '胡萝卜'],
        ['虾仁', '蒜蓉', '粉丝'],
        ['豆腐', '香菇', '青菜'],
        ['猪肉', '大白菜', '生姜'],
        ['茄子', '青椒', '蒜'],
        ['米饭', '鸡蛋', '酱油']
      ]
    : [
        ['eggs', 'tomatoes', 'scallions'],
        ['potatoes', 'beef', 'onions'],
        ['salmon', 'lemon', 'butter'],
        ['pasta', 'basil', 'garlic'],
        ['chicken breast', 'broccoli', 'carrots'],
        ['shrimp', 'garlic', 'vermicelli'],
        ['tofu', 'mushrooms', 'bok choy'],
        ['pork', 'cabbage', 'ginger'],
        ['eggplant', 'bell peppers', 'garlic'],
        ['rice', 'eggs', 'soy sauce']
      ];

  // 随机生成食材并触发生成
  const handleRandomGenerate = () => {
    // 随机选择一组食材
    const randomIndex = Math.floor(Math.random() * randomIngredientsPool.length);
    const randomIngredients = randomIngredientsPool[randomIndex].join(', ');

    // 设置食材
    setIngredients(randomIngredients);

    // 延迟一下，让用户看到食材已填充
    setTimeout(() => {
      // 自动触发生成
      handleGenerateClick();
    }, 300);
  }

  const FilterGroup: React.FC<{ title: string; options: readonly string[]; type: keyof SearchFilters }> = ({ title, options, type }) => (
    <div className="flex flex-wrap items-center gap-2 md:gap-3">
      <span className="text-white font-medium text-sm">{title}:</span>
      {options.map(option => (
        <button
          key={option}
          onClick={() => handleFilterChange(type, option)}
          className={`px-3 py-1 text-sm rounded-full transition-colors duration-200 ${
            filters[type] === option
              ? 'bg-orange-500 text-white shadow-md'
              : 'bg-white/20 text-white backdrop-blur-sm hover:bg-white/30'
          }`}
        >
          {/* FIX: Cast dynamic string to the type of the `t` function's first parameter (`TranslationKey`) to resolve TypeScript error. */}
          {t(`filters.${type}.${option}` as Parameters<typeof t>[0])}
        </button>
      ))}
    </div>
  );
  
  return (
    <div className="bg-slate-50 min-h-screen text-slate-800">
      <Header />

      <main>
        {/* Hero Section */}
        <div className="relative bg-cover bg-center h-[60vh] md:h-[70vh] flex items-center justify-center" style={{ backgroundImage: "url('https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2')" }}>
          <div className="absolute inset-0 bg-black/50"></div>
          <div className="relative z-10 container mx-auto px-4 text-center text-white flex flex-col items-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-4 drop-shadow-lg">{t('hero.title')}</h1>
            <p className="text-lg md:text-xl mb-8 max-w-2xl drop-shadow-md">{t('hero.subtitle')}</p>
            
            <div className="w-full max-w-3xl bg-white/10 backdrop-blur-md p-4 md:p-6 rounded-xl shadow-lg">
              <div className="relative">
                <input
                  type="text"
                  value={ingredients}
                  onChange={(e) => setIngredients(e.target.value)}
                  placeholder={t('hero.placeholder')}
                  className="w-full p-4 pr-12 text-lg text-slate-900 rounded-lg border-2 border-transparent focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
                <button
                  onClick={handleRandomGenerate}
                  disabled={isLoading}
                  className="absolute right-4 top-1/2 -translate-y-1/2 h-8 w-8 flex items-center justify-center rounded-full hover:bg-orange-100 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed group"
                  title={language === 'zh' ? '随机生成食谱' : 'Generate random recipe'}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-orange-500 group-hover:text-orange-600 group-hover:rotate-12 transition-all duration-200">
                    <rect width="12" height="12" x="2" y="10" rx="2" ry="2"></rect>
                    <path d="m17.92 14 3.5-3.5a2.24 2.24 0 0 0 0-3l-5-4.92a2.24 2.24 0 0 0-3 0L10 6"></path>
                    <path d="M6 18h.01"></path>
                    <path d="M10 14h.01"></path>
                    <path d="M15 6h.01"></path>
                    <path d="M18 9h.01"></path>
                  </svg>
                </button>
              </div>
              <div className="mt-4 flex flex-col md:flex-row gap-4 justify-center">
                  <FilterGroup title={t('filters.preference.title')} options={PREFERENCE_OPTIONS} type="preference" />
                  <FilterGroup title={t('filters.difficulty.title')} options={DIFFICULTY_OPTIONS} type="difficulty" />
                  <FilterGroup title={t('filters.diet.title')} options={DIET_OPTIONS} type="diet" />
              </div>
              <button
                onClick={handleGenerateClick}
                disabled={isLoading}
                className="mt-6 w-full md:w-auto bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-bold py-3 px-12 text-lg rounded-lg transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6"><path d="M15.5 2.5a2.5 2.5 0 0 0-3.5 0L8.5 6H5a2 2 0 0 0-2 2v3.5a2.5 2.5 0 0 0 0 3.5L6.5 19a2.5 2.5 0 0 0 3.5 0L13.5 15H17a2 2 0 0 0 2-2v-3.5a2.5 2.5 0 0 0 0-3.5L15.5 2.5z"></path></svg>
                )}
                <span>{isLoading ? t('hero.button.loading') : t('hero.button.default')}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Today's Picks Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-10">{t('picks.title')}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              <RecipeCard
                image="https://images.pexels.com/photos/2338407/pexels-photo-2338407.jpeg?auto=compress&cs=tinysrgb&w=800"
                name={t('picks.recipes.chicken')}
                tags={[t('tags.quick'), t('tags.healthy')]}
                onClick={() => handleSampleRecipeClick('chicken')}
              />
              <RecipeCard
                image="https://images.pexels.com/photos/1437267/pexels-photo-1437267.jpeg?auto=compress&cs=tinysrgb&w=800"
                name={t('picks.recipes.pasta')}
                tags={[t('tags.vegetarian'), t('tags.classic')]}
                onClick={() => handleSampleRecipeClick('pasta')}
              />
              <RecipeCard
                image="https://images.pexels.com/photos/262959/pexels-photo-262959.jpeg?auto=compress&cs=tinysrgb&w=800"
                name={t('picks.recipes.salmon')}
                tags={[t('tags.lowCal'), t('tags.seafood')]}
                onClick={() => handleSampleRecipeClick('salmon')}
              />
              <RecipeCard
                image="https://images.pexels.com/photos/539451/pexels-photo-539451.jpeg?auto=compress&cs=tinysrgb&w=800"
                name={t('picks.recipes.soup')}
                tags={[t('tags.comfort'), t('tags.western')]}
                onClick={() => handleSampleRecipeClick('soup')}
              />
            </div>
          </div>
        </section>

        {/* Community Section */}
        <section className="py-16 bg-slate-50">
          <div className="container mx-auto px-4">
            <div className="bg-gradient-to-r from-orange-400 to-red-500 rounded-lg shadow-xl p-12 text-center text-white">
              <h2 className="text-3xl font-bold mb-4">{t('community.title')}</h2>
              <p className="text-lg mb-8">{t('community.subtitle')}</p>
              <button className="bg-white text-orange-500 font-bold py-3 px-8 rounded-full text-lg hover:bg-slate-100 transition-colors duration-300">
                {t('community.button')}
              </button>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-slate-800 text-slate-400 py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="font-bold text-lg text-white mb-2">AI Chef</p>
          <p className="text-sm">{t('footer.copyright', { year: new Date().getFullYear() })}</p>
        </div>
      </footer>

      {(generatedRecipe || error) && (
        <GeneratedRecipeModal
          recipe={generatedRecipe}
          error={error}
          onClose={closeModal}
        />
      )}
    </div>
  );
};

export default App;
