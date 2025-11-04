


function sendToDify(selections) {
  console.log("送信開始");
  fetch('https://selectlanchserver.onrender.com/send-to-dify', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      inputs: {
        country: selections.selectedCountry,
        main: selections.selectedMain,
        dish: selections.selectedMainDish
      },
      user: "user"
    })
  })
  .then(response => {
    if (!response.ok) throw new Error("Dify送信に失敗しました。");
    return response.json();
  }).then(res => {
    console.log(res);
  
    // 安全に result を取得
    const aiReply = res.data?.outputs?.result ?? "AIからの返答がありません";
    console.log("Difyの返答", aiReply);
  
    const t = `/result.html?ai=${encodeURIComponent(aiReply)}`;
    document.getElementById("resultBox").innerHTML = `
      <br>
      <a href="${t}" target="_blank" style="color: #2196f3; font-weight: bold;">
        🤖 AIの提案を別ページで見る
      </a>
    `;
  })
  .catch(error => {
    console.error("エラー", error);
  });
}

document.addEventListener('DOMContentLoaded', function() {
  let finalSelections = {
    selectedCountry: null,
    selectedMain: null,
    selectedMainDish: null
  };

  function setupRandomSelector(buttonId, displayId, items, key) {
    const button = document.getElementById(buttonId);
    const display = document.getElementById(displayId);
    let selectedIndexes = [];

    button.addEventListener("click", function () {
      if (selectedIndexes.length === items.length) {
        selectedIndexes = [];
        console.log("全て表示されたのでリセットします。");
      }

      let number;
      do {
        number = Math.floor(Math.random() * items.length);
      } while (selectedIndexes.includes(number));

      selectedIndexes.push(number);
      const result = items[number];
      display.textContent = result;
      finalSelections[key] = result;

      checkAllSelections();
    });
  }

  function checkAllSelections() {
    const values = Object.values(finalSelections);
    const allSelected = values.every(value => value !== null);

    if (allSelected) {
      setTimeout(() => {
        const resultText = `今日のご飯は…<br>
          🍽️ <strong>ジャンル：</strong>${finalSelections.selectedCountry}<br>
          🍞 <strong>主食：</strong>${finalSelections.selectedMain}<br>
          🍖 <strong>メイン：</strong>${finalSelections.selectedMainDish}<br>
          <button id="askAIButton">AIにレシピ聞く</button>`;

          const resultBox = document.getElementById("resultBox");
          resultBox.innerHTML = resultText;
          resultBox.classList.add("show");

          const askAIButton = document.getElementById("askAIButton");
      askAIButton.addEventListener("click", () => {

        const message = `${finalSelections.selectedCountry}の料理で、主食は${finalSelections.selectedMain}、メインは${finalSelections.selectedMainDish}のレシピを教えて`;
        sendToDify(finalSelections);
        // AIとの連携処理などをここに記述（例: fetchでAPI呼び出し）
        alert("AIにレシピを聞いています。:\n\n" + message);
      });

          

          setTimeout(() => {
            resultBox.classList.remove("show");
            resultBox.innerHTML = "";
            resetAll();
      },50000);
          }, 200);
    }
  }

  function resetAll() {
    finalSelections = {
      selectedCountry: null,
      selectedMain: null,
      selectedMainDish: null
    };

    document.getElementById("selectedCountry").textContent = "";
    document.getElementById("selectedMain").textContent = "";
    document.getElementById("selectedMainDish").textContent = "";
    }

    document.getElementById("askAIButton").addEventListener("click", function () {
      const values = Object.values(finalSelections);
      const allSelected = values.every(value => value !== null);
    
      if (allSelected) {
        sendToDify(finalSelections);
      } else {
        alert("全ての項目を選んでからAIに聞いて下さい");
      }
    });

    setupRandomSelector("selectCountryButton", "selectedCountry", ["中華", "イタリアン", "和食", "アメリカ"], "selectedCountry");
    setupRandomSelector("selectMainButton", "selectedMain", ["白米", "和めん", "パスタ", "ぱん"], "selectedMain");
    setupRandomSelector("selectMainDishButton", "selectedMainDish", ["鶏肉", "牛肉", "豚肉", "魚", "魚介（魚以外"], "selectedMainDish");
})




const defaultOptions = {
  // ドットインジケーターの表示
  pagination: {
    el: ".swiper-pagination",
    clickable: true,
  },
  // 前後スライドボタンを表示
  navigation: {
    nextEl: ".swiper-button-next",
    prevEl: ".swiper-button-prev",
  },
  loop: true, // ループの有効化
  slidesPerView: 1,
}

// デフォルトの表示
const swiper = new Swiper(".sample-swiper .swiper-container", {
  ...defaultOptions,
});

// フェードエフェクト
const swiperFade = new Swiper(".sample-swiper-fade .swiper-container", {
  ...defaultOptions,

  effect: "fade",
  fadeEffect: {
    crossFade: true
  },
});

// カバーフローエフェクト
const swiperCoverflow = new Swiper(".sample-swiper-coverflow .swiper-container", {
  ...defaultOptions,

  slidesPerView: 1.6, // 表示するスライドの枚数
  centeredSlides : true, // スライドを中央揃えを有効化
  effect: "coverflow",
  coverflowEffect: {
    rotate: 0, // スライドの回転角度
    stretch: 50, // スライドの間隔（px単位）
    depth: 200, // 奥行きの設定（translateをZ方向にpx単位で移動）
    slideShadows : true, // 先頭スライドの影を有効化
  },
});

// カードエフェクト
const swiperCards = new Swiper(".sample-swiper-cards .swiper-container", {
  ...defaultOptions,

  grabCursor: true,
  effect: "cards",
});

// クリエイティブエフェクト
const swiperCreative = new Swiper(".sample-swiper-creative .swiper-container", {
  ...defaultOptions,

  grabCursor: true,
  effect: "creative",
  creativeEffect: {
    prev: { // 表示しているスライドの移動先
      shadow: true, // 影の有効化
      translate: [0, 0, -400], // translateをX,Y,Zで指定
    },
    next: { // 次に表示されるスライドの設定
      translate: ["100%", 0, 0], // translateをX,Y,Zで指定
    },
  },
});

// ===== searchLanch.html 用の検索機能 =====
if (document.getElementById('searchInput')) {
  let dishesData = {};
  let currentCategory = 'all';

  // dishes.jsonを読み込む
  fetch('/dishes.json')
    .then(response => response.json())
    .then(data => {
      dishesData = data;
      displayAllDishes();
    })
    .catch(error => {
      console.error('料理データの読み込みに失敗しました:', error);
    });

  // 検索ボタンのイベント
  document.getElementById('searchButton').addEventListener('click', performSearch);

  // Enterキーでも検索できるように
  document.getElementById('searchInput').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
      performSearch();
    }
  });

  // カテゴリーフィルターのイベント
  document.querySelectorAll('.filter__button').forEach(button => {
    button.addEventListener('click', function() {
      document.querySelectorAll('.filter__button').forEach(btn => btn.classList.remove('active'));
      this.classList.add('active');
      currentCategory = this.dataset.category;
      performSearch();
    });
  });

  function performSearch() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const resultsGrid = document.getElementById('resultsGrid');

    if (!searchTerm) {
      displayAllDishes();
      return;
    }

    const results = [];

    // 全ての地域と国を検索
    for (const [region, countries] of Object.entries(dishesData)) {
      for (const [country, dishes] of Object.entries(countries)) {
        dishes.forEach(dish => {
          const dishName = typeof dish === 'string' ? dish : dish.name || '';
          if (dishName.toLowerCase().includes(searchTerm) ||
              country.toLowerCase().includes(searchTerm) ||
              region.toLowerCase().includes(searchTerm)) {
            results.push({ dish: dishName, country, region });
          }
        });
      }
    }

    displayResults(results);
  }

  function displayAllDishes() {
    const results = [];

    for (const [region, countries] of Object.entries(dishesData)) {
      for (const [country, dishes] of Object.entries(countries)) {
        dishes.forEach(dish => {
          const dishName = typeof dish === 'string' ? dish : dish.name || '';
          results.push({ dish: dishName, country, region });
        });
      }
    }

    displayResults(results);
  }

  function displayResults(results) {
    const resultsGrid = document.getElementById('resultsGrid');

    if (results.length === 0) {
      resultsGrid.innerHTML = '<p class="no-results">検索結果が見つかりませんでした</p>';
      return;
    }

    resultsGrid.innerHTML = results.map(item => `
      <div class="dish-card">
        <div class="dish-card__header">
          <h3 class="dish-card__name">${item.dish}</h3>
        </div>
        <div class="dish-card__body">
          <p class="dish-card__country">
            <i class="fas fa-map-marker-alt"></i> ${item.country}
          </p>
          <p class="dish-card__region">
            <i class="fas fa-globe"></i> ${item.region}
          </p>
        </div>
      </div>
    `).join('');
  }
}