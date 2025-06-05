import os
import time
import csv
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from webdriver_manager.chrome import ChromeDriverManager
from dotenv import load_dotenv

load_dotenv()

def setup_driver(headless=False):
    chrome_options = Options()
    if headless:
        chrome_options.add_argument('--headless')
    chrome_options.add_argument('--no-sandbox')
    chrome_options.add_argument('--disable-dev-shm-usage')
    chrome_options.add_argument('--window-size=1920,1080')
    service = Service(ChromeDriverManager().install())
    driver = webdriver.Chrome(service=service, options=chrome_options)
    driver.set_page_load_timeout(30)
    return driver

def login_to_financie(driver, email, password, wait_timeout=30):
    driver.get('https://financie.jp/home')
    WebDriverWait(driver, wait_timeout).until(EC.presence_of_element_located((By.ID, 'signin_email')))
    driver.find_element(By.ID, 'signin_email').send_keys(email)
    driver.find_element(By.ID, 'signin_password').send_keys(password)
    driver.find_element(By.CSS_SELECTOR, 'button[type="submit"]').click()
    WebDriverWait(driver, wait_timeout).until(lambda d: 'home' in d.current_url or 'mypage' in d.current_url)
    return True

from datetime import datetime, timedelta

def save_trading_history_to_csv(driver, filename="trading_history.csv"):
    # 前日の日付を取得
    now = datetime.now()
    prev_day = (now - timedelta(days=1)).strftime("%Y/%m/%d")
    print(f"前日: {prev_day}")

    rows = driver.find_elements(By.CSS_SELECTOR, "table.history-table tbody tr.js-bancor-recent-trading-log")
    with open(filename, "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow([
            "日時", "金額(円)", "取引トークン数", "トークン単価(円/トークン)", "取引種別",
            "data-currency-amount", "data-token-amount", "data-unit-price", "data-id"
        ])
        for row in rows:
            tds = row.find_elements(By.TAG_NAME, "td")
            date = tds[0].text if len(tds) > 0 else ''
            # 日付の先頭10文字で前日か判定
            if not date.startswith(prev_day):
                continue
            currency_amount = row.get_attribute("data-currency-amount")
            token_amount = row.get_attribute("data-token-amount")
            unit_price = row.get_attribute("data-unit-price")
            trade_type = "buy" if "buy" in row.get_attribute("class") else "sell"
            data_id = row.get_attribute("data-id")
            writer.writerow([
                date,
                currency_amount,
                token_amount,
                unit_price,
                trade_type,
                currency_amount,
                token_amount,
                unit_price,
                data_id
            ])
    print(f"{prev_day}分の取引履歴を {filename} に保存しました")

def main():
    email = os.getenv('FINANCIE_EMAIL')
    password = os.getenv('FINANCIE_PASSWORD')
    community_url = os.getenv('COMMUNITY_URL')
    if not all([email, password, community_url]):
        print("環境変数を設定してください")
        return

    driver = setup_driver(headless=False)
    try:
        login_to_financie(driver, email, password)
        print("ログイン成功")

        # 1. マーケットページへ
        driver.get(community_url)
        print("マーケットページへ移動")
        time.sleep(3)

        # 2. 「購入」リンクを探してJSでクリック
        try:
            buy_link = driver.find_element(By.LINK_TEXT, "購入")
            driver.execute_script("arguments[0].scrollIntoView(true);", buy_link)
            time.sleep(1)
            driver.execute_script("arguments[0].click();", buy_link)
            print("購入リンクをJavaScriptでクリックしました")
            with open("popup_debug.html", "w", encoding="utf-8") as f:
                f.write(driver.page_source)
            print("ポップアップHTMLを保存しました（popup_debug.html）")
            time.sleep(5)  # ポップアップの描画を待つ
        except Exception as e:
            print("購入リンクが見つかりません:", e)
            driver.save_screenshot("no_buy_link.png")
            return

        time.sleep(3)

        # 3. ポップアップ内の「取引履歴」タブ（ラベル）をクリック
        try:
            # まずはlabelでクリック
            trading_label = WebDriverWait(driver, 10).until(
                EC.element_to_be_clickable((By.XPATH, "//label[contains(., '取引履歴')]"))
            )
            trading_label.click()
            print("取引履歴タブ（ラベル）をクリックしました")
        except Exception as e1:
            print("取引履歴タブ（ラベル）が見つかりません:", e1)
            driver.save_screenshot("no_trading_tab_label.png")
            # 次にcheckboxを直接クリック
            try:
                accordion_checkbox = driver.find_element(By.ID, "table_accordion")
                driver.execute_script("arguments[0].click();", accordion_checkbox)
                print("取引履歴のアコーディオンを開きました")
            except Exception as e2:
                print("取引履歴アコーディオンが見つかりません:", e2)
                driver.save_screenshot("no_trading_tab_checkbox.png")
                return

        time.sleep(2)

        # 4. スクロールして追加データを読み込む（必要に応じて繰り返す）
        try:
            table_outer = driver.find_element(By.CSS_SELECTOR, "section.trade_history .table-outer")
            for _ in range(5):
                driver.execute_script("arguments[0].scrollTop = arguments[0].scrollHeight", table_outer)
                time.sleep(1)
        except Exception as e:
            print("取引履歴テーブルのスクロールに失敗:", e)

        # 5. ページのHTMLとスクリーンショットを保存
        with open("trading_history_popup.html", "w", encoding="utf-8") as f:
            f.write(driver.page_source)
        driver.save_screenshot("trading_history_popup.png")
        print("取引履歴ポップアップのHTMLとスクリーンショットを保存しました")

        # 6. 取引履歴をCSVで保存
        save_trading_history_to_csv(driver)

    except Exception as e:
        print("エラー:", e)
        driver.save_screenshot("error.png")
    finally:
        driver.quit()
        print("ブラウザを終了しました")

if __name__ == "__main__":
    main()
