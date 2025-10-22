/*
  Arduino 來回跑馬燈程式
  使用腳位 4~12 實現來回跑馬燈效果
  每個燈亮 500ms
*/

// 定義使用的腳位範圍
const int startPin = 4;
const int endPin = 12;
const int totalPins = endPin - startPin + 1; // 總共9個腳位

// 定義延遲時間 (毫秒)
const int delayTime = 500;

void setup() {
  // 設置腳位 4~12 為輸出模式
  for (int pin = startPin; pin <= endPin; pin++) {
    pinMode(pin, OUTPUT);
    digitalWrite(pin, LOW); // 初始化所有LED為關閉狀態
  }
  
  // 初始化序列埠用於除錯 (可選)
  Serial.begin(9600);
  Serial.println("Arduino 來回跑馬燈啟動");
}

void loop() {
  // 正向跑馬燈 (4 -> 12)
  for (int pin = startPin; pin <= endPin; pin++) {
    digitalWrite(pin, HIGH);  // 點亮當前LED
    delay(delayTime);         // 等待500ms
    digitalWrite(pin, LOW);   // 關閉當前LED
  }
  
  // 反向跑馬燈 (11 -> 5) 
  // 注意：不包含12和4，避免重複點亮
  for (int pin = endPin - 1; pin >= startPin + 1; pin--) {
    digitalWrite(pin, HIGH);  // 點亮當前LED
    delay(delayTime);         // 等待500ms
    digitalWrite(pin, LOW);   // 關閉當前LED
  }
}