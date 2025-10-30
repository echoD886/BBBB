const translations = {
  en: {
    header: {
      chef: 'Chef',
      home: 'Home',
      generator: 'AI Recipe Generator',
      community: 'Community',
      kitchen: 'My Kitchen',
    },
    hero: {
      title: 'Discover Infinite Flavors',
      subtitle: 'Enter the ingredients you have, and let AI create a surprise for you',
      placeholder: 'e.g., chicken, potatoes, onion...',
      button: {
        default: 'Generate with AI',
        loading: 'Generating...',
      },
    },
    filters: {
      preference: {
        title: 'Flavor Profile',
        chinese: 'Chinese',
        western: 'Western',
        spicy: 'Spicy',
        light: 'Light',
      },
      difficulty: {
        title: 'Difficulty',
        easy: 'Easy',
        medium: 'Medium',
        hard: 'Hard',
      },
      diet: {
        title: 'Dietary Goal',
        balanced: 'Balanced',
        'low-fat': 'Low-Fat',
        'high-protein': 'High-Protein',
        vegetarian: 'Vegetarian',
      },
    },
    picks: {
        title: "Today's Picks",
        recipes: {
            chicken: "Herb Roasted Chicken",
            pasta: "Tomato Basil Pasta",
            salmon: "Lemon Garlic Salmon",
            soup: "Creamy Mushroom Soup"
        }
    },
    tags: {
        quick: 'Quick',
        healthy: 'Healthy',
        vegetarian: 'Vegetarian',
        classic: 'Classic',
        lowCal: 'Low-Cal',
        seafood: 'Seafood',
        comfort: 'Comfort',
        western: 'Western'
    },
    community: {
      title: 'Join Our Food Community!',
      subtitle: 'Participate in the Spring Food Challenge, share your AI-created recipes, and win amazing prizes.',
      button: 'Join Now',
    },
    footer: {
      copyright: '© {{year}}. Smart Cooking, Bright Life.',
    },
    modal: {
        title: 'Generation Result',
        prepTime: 'Prep Time',
        cookTime: 'Cook Time',
        servings: 'Servings',
        ingredients: 'Ingredients',
        instructions: 'Instructions',
        error: {
            title: 'Oops, something went wrong!',
        }
    },
    error: {
        noIngredients: 'Please enter the ingredients you have.',
        invalidRecipeFormat: 'The AI response was incomplete. Please try again.',
        quotaExceeded: 'OpenAI quota is exceeded. Check billing or try later.',
        invalidKey: 'OpenAI API key is invalid or missing. Update the key.',
        unknown: 'An unknown error occurred. Please try again later.'
    }
  },
  zh: {
    header: {
      chef: '私厨',
      home: '首页',
      generator: 'AI生成菜谱',
      community: '食谱社区',
      kitchen: '我的厨房',
    },
    hero: {
      title: '发现无限美味',
      subtitle: '输入你现有的食材，让AI为你创造惊喜',
      placeholder: '例如：鸡肉，土豆，洋葱...',
      button: {
        default: 'AI智能生成',
        loading: '生成中...',
      },
    },
    filters: {
      preference: {
        title: '口味偏好',
        chinese: '中餐',
        western: '西餐',
        spicy: '香辣',
        light: '清淡',
      },
      difficulty: {
        title: '烹饪难度',
        easy: '简单',
        medium: '中等',
        hard: '困难',
      },
      diet: {
        title: '膳食目标',
        balanced: '均衡',
        'low-fat': '低脂',
        'high-protein': '高蛋白',
        vegetarian: '素食',
      },
    },
    picks: {
        title: '今日精选',
        recipes: {
            chicken: "香草烤鸡",
            pasta: "番茄罗勒意面",
            salmon: "柠檬蒜香三文鱼",
            soup: "奶油蘑菇汤"
        }
    },
    tags: {
        quick: '快手',
        healthy: '健康',
        vegetarian: '素食',
        classic: '经典',
        lowCal: '低卡',
        seafood: '海鲜',
        comfort: '治愈系',
        western: '西式'
    },
    community: {
      title: '加入我们的美食社区！',
      subtitle: '参与春日美食挑战，分享你用AI创造的菜谱，赢取精美奖品。',
      button: '立即加入',
    },
    footer: {
      copyright: '© {{year}}. 智能烹饪，点亮生活。',
    },
    modal: {
        title: '生成结果',
        prepTime: '准备时间',
        cookTime: '烹饪时间',
        servings: '份量',
        ingredients: '所需食材',
        instructions: '制作步骤',
        error: {
            title: '哎呀，出错了！',
        }
    },
    error: {
        noIngredients: '请输入你拥有的食材。',
        invalidRecipeFormat: 'AI 返回的数据不完整，请重试。',
        quotaExceeded: 'OpenAI 配额已用完，请检查账单或稍后再试。',
        invalidKey: 'OpenAI API Key 无效或缺失，请更新密钥。',
        unknown: '发生未知错误，请稍后再试。'
    }
  },
};

// This utility type helps with TypeScript autocomplete
type PathImpl<T, K extends keyof T> = K extends string
  ? T[K] extends Record<string, any>
    ? `${K}.${PathImpl<T[K], keyof T[K]>}`
    : K
  : never;
type Path<T> = PathImpl<T, keyof T>;
export type TranslationKey = Path<typeof translations.en>;

export { translations };
