-- questions 테이블에 영어/일본어 번역 컬럼 추가
ALTER TABLE questions
  ADD COLUMN question_text_en TEXT,
  ADD COLUMN question_text_ja TEXT,
  ADD COLUMN option_a_en TEXT,
  ADD COLUMN option_a_ja TEXT,
  ADD COLUMN option_b_en TEXT,
  ADD COLUMN option_b_ja TEXT;

-- 기존 20개 질문에 영어/일본어 번역 채워넣기
UPDATE questions SET
  question_text_en = 'What is more important in life?',
  question_text_ja = '人生でより大切なものは？',
  option_a_en = 'A stable life',
  option_a_ja = '安定した生活',
  option_b_en = 'A challenging life',
  option_b_ja = '挑戦的な生活'
WHERE question_text = '인생에서 더 중요한 것은?';

UPDATE questions SET
  question_text_en = 'If you had to choose between money and time?',
  question_text_ja = 'お金と時間、どちらかを選ぶなら？',
  option_a_en = 'Enough money',
  option_a_ja = '十分なお金',
  option_b_en = 'Enough time',
  option_b_ja = '十分な時間'
WHERE question_text = '돈과 시간 중 하나만 선택한다면?';

UPDATE questions SET
  question_text_en = 'What is your standard of success?',
  question_text_ja = 'あなたにとっての成功の基準は？',
  option_a_en = 'Social recognition',
  option_a_ja = '社会的な認知',
  option_b_en = 'Personal satisfaction',
  option_b_ja = '個人的な満足'
WHERE question_text = '성공의 기준은?';

UPDATE questions SET
  question_text_en = 'When making an important decision?',
  question_text_ja = '重要な決断をするとき？',
  option_a_en = 'Logic and analysis',
  option_a_ja = '論理と分析で判断',
  option_b_en = 'Intuition and feeling',
  option_b_ja = '直感と感覚で判断'
WHERE question_text = '중요한 결정을 내릴 때?';

UPDATE questions SET
  question_text_en = 'What is your ideal weekend?',
  question_text_ja = '理想の週末は？',
  option_a_en = 'Netflix at home',
  option_a_ja = '家でNetflix',
  option_b_en = 'Active outdoors',
  option_b_ja = '外でアクティブに'
WHERE question_text = '이상적인 주말은?';

UPDATE questions SET
  question_text_en = 'Your travel style?',
  question_text_ja = '旅行スタイルは？',
  option_a_en = 'Plan everything in advance',
  option_a_ja = '徹底的に計画を立てる',
  option_b_en = 'Go on a whim',
  option_b_ja = '思い立ったら即出発'
WHERE question_text = '여행 스타일은?';

UPDATE questions SET
  question_text_en = 'Your dining style?',
  question_text_ja = '食事スタイルは？',
  option_a_en = 'Explore trendy restaurants',
  option_a_ja = '話題のお店を探して行く',
  option_b_en = 'Cook at home',
  option_b_ja = '家で料理する'
WHERE question_text = '식사 스타일은?';

UPDATE questions SET
  question_text_en = 'Your view on exercise?',
  question_text_ja = '運動についての考えは？',
  option_a_en = 'I exercise regularly',
  option_a_ja = '定期的に運動する',
  option_b_en = 'I move only when necessary',
  option_b_ja = '必要なときだけ動く'
WHERE question_text = '운동에 대한 생각은?';

UPDATE questions SET
  question_text_en = 'How often do you want to contact your partner?',
  question_text_ja = '恋人との連絡頻度は？',
  option_a_en = 'I want to text all the time',
  option_a_ja = 'いつでも連絡したい',
  option_b_en = 'Personal time matters too',
  option_b_ja = 'お互いの時間も大切'
WHERE question_text = '연인과의 연락 빈도는?';

UPDATE questions SET
  question_text_en = 'When there is a conflict?',
  question_text_ja = '葛藤が生じたとき？',
  option_a_en = 'Talk it out right away',
  option_a_ja = 'すぐ話し合って解決',
  option_b_en = 'Take time, then talk',
  option_b_ja = '時間をおいて整理してから話す'
WHERE question_text = '갈등이 생겼을 때?';

UPDATE questions SET
  question_text_en = 'How do you express affection?',
  question_text_ja = '愛情表現のスタイルは？',
  option_a_en = 'Express actively with words and actions',
  option_a_ja = '言葉と行動で積極的に表現',
  option_b_en = 'Show it subtly through actions',
  option_b_ja = 'さりげなく行動で示す'
WHERE question_text = '애정 표현 방식은?';

UPDATE questions SET
  question_text_en = 'What do you want more from your partner?',
  question_text_ja = '恋人に求めるものは？',
  option_a_en = 'Time spent together',
  option_a_ja = '一緒に過ごす時間',
  option_b_en = 'Space for each other',
  option_b_ja = 'お互いのための空間'
WHERE question_text = '연인에게 더 원하는 것은?';

UPDATE questions SET
  question_text_en = 'When meeting new people?',
  question_text_ja = '初対面の人と会うとき？',
  option_a_en = 'I approach first',
  option_a_ja = '自分から話しかける',
  option_b_en = 'I respond when they approach',
  option_b_ja = '相手が来たら応答する'
WHERE question_text = '새로운 사람을 만날 때?';

UPDATE questions SET
  question_text_en = 'When stressed?',
  question_text_ja = 'ストレスを感じたら？',
  option_a_en = 'Hang out with people',
  option_a_ja = '人と交わって発散',
  option_b_en = 'Have alone time',
  option_b_ja = '一人の時間で回復'
WHERE question_text = '스트레스를 받으면?';

UPDATE questions SET
  question_text_en = 'Regarding meeting time?',
  question_text_ja = '待ち合わせ時間について？',
  option_a_en = 'Always arrive 10 minutes early',
  option_a_ja = 'いつも10分前に到着',
  option_b_en = 'Arrive right on time',
  option_b_ja = 'ちょうどに着く'
WHERE question_text = '약속 시간에 대해?';

UPDATE questions SET
  question_text_en = 'When plans change?',
  question_text_ja = '予定が変わったとき？',
  option_a_en = 'I adapt flexibly',
  option_a_ja = '柔軟に対応できる',
  option_b_en = 'I get a bit stressed',
  option_b_ja = '少しストレスを感じる'
WHERE question_text = '계획이 바뀌었을 때?';

UPDATE questions SET
  question_text_en = 'Your favorite season?',
  question_text_ja = '好きな季節は？',
  option_a_en = 'Warm spring / summer',
  option_a_ja = '暖かい春・夏',
  option_b_en = 'Cool autumn / winter',
  option_b_ja = '涼しい秋・冬'
WHERE question_text = '좋아하는 계절은?';

UPDATE questions SET
  question_text_en = 'If watching a movie?',
  question_text_ja = '映画を観るなら？',
  option_a_en = 'Romance / Drama',
  option_a_ja = 'ロマンス・ドラマ',
  option_b_en = 'Action / Thriller',
  option_b_ja = 'アクション・スリラー'
WHERE question_text = '영화를 본다면?';

UPDATE questions SET
  question_text_en = 'If you had a pet?',
  question_text_ja = 'ペットを飼うなら？',
  option_a_en = 'Dog',
  option_a_ja = '犬',
  option_b_en = 'Cat',
  option_b_ja = '猫'
WHERE question_text = '반려동물을 키운다면?';

UPDATE questions SET
  question_text_en = 'Coffee vs Tea?',
  question_text_ja = 'コーヒー派 vs お茶派？',
  option_a_en = 'Coffee person',
  option_a_ja = 'コーヒー派',
  option_b_en = 'Tea person',
  option_b_ja = 'お茶派'
WHERE question_text = '커피 vs 차?';
