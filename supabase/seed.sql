-- 시드 데이터: 20개 양자택일 질문 (ko / en / ja)
INSERT INTO questions (
  category,
  question_text,    question_text_en,                              question_text_ja,
  option_a,         option_a_en,                                   option_a_ja,
  option_b,         option_b_en,                                   option_b_ja,
  weight
) VALUES

-- 가치관 (values)
('values',
 '인생에서 더 중요한 것은?',          'What is more important in life?',             '人生でより大切なものは？',
 '안정적인 삶',                        'A stable life',                               '安定した生活',
 '도전적인 삶',                        'A challenging life',                          '挑戦的な生活',
 5),

('values',
 '돈과 시간 중 하나만 선택한다면?',   'If you had to choose between money and time?', 'お金と時間、どちらかを選ぶなら？',
 '충분한 돈',                          'Enough money',                                '十分なお金',
 '충분한 시간',                        'Enough time',                                 '十分な時間',
 4),

('values',
 '성공의 기준은?',                     'What is your standard of success?',           'あなたにとっての成功の基準は？',
 '사회적 인정',                        'Social recognition',                          '社会的な認知',
 '개인적 만족',                        'Personal satisfaction',                       '個人的な満足',
 5),

('values',
 '중요한 결정을 내릴 때?',            'When making an important decision?',           '重要な決断をするとき？',
 '논리와 분석으로 판단',              'Logic and analysis',                           '論理と分析で判断',
 '직감과 느낌으로 판단',              'Intuition and feeling',                        '直感と感覚で判断',
 3),

-- 라이프스타일 (lifestyle)
('lifestyle',
 '이상적인 주말은?',                   'What is your ideal weekend?',                 '理想の週末は？',
 '집에서 넷플릭스',                   'Netflix at home',                              '家でNetflix',
 '밖에서 활동적으로',                 'Active outdoors',                              '外でアクティブに',
 3),

('lifestyle',
 '여행 스타일은?',                     'Your travel style?',                          '旅行スタイルは？',
 '계획을 철저하게',                   'Plan everything in advance',                   '徹底的に計画を立てる',
 '즉흥적으로 떠나기',                 'Go on a whim',                                '思い立ったら即出発',
 3),

('lifestyle',
 '식사 스타일은?',                     'Your dining style?',                          '食事スタイルは？',
 '맛집을 찾아다니는 편',              'Explore trendy restaurants',                   '話題のお店を探して行く',
 '집에서 요리하는 편',                'Cook at home',                                '家で料理する',
 2),

('lifestyle',
 '운동에 대한 생각은?',               'Your view on exercise?',                      '運動についての考えは？',
 '규칙적으로 운동한다',               'I exercise regularly',                         '定期的に運動する',
 '필요할 때만 움직인다',              'I move only when necessary',                   '必要なときだけ動く',
 2),

-- 연애관 (romance)
('romance',
 '연인과의 연락 빈도는?',             'How often do you want to contact your partner?', '恋人との連絡頻度は？',
 '수시로 연락하고 싶다',              'I want to text all the time',                  'いつでも連絡したい',
 '각자 시간도 중요하다',              'Personal time matters too',                    'お互いの時間も大切',
 5),

('romance',
 '갈등이 생겼을 때?',                 'When there is a conflict?',                   '葛藤が生じたとき？',
 '바로 대화로 해결',                  'Talk it out right away',                       'すぐ話し合って解決',
 '시간을 두고 정리 후 대화',          'Take time, then talk',                         '時間をおいて整理してから話す',
 4),

('romance',
 '애정 표현 방식은?',                 'How do you express affection?',               '愛情表現のスタイルは？',
 '말과 행동으로 적극 표현',           'Express actively with words and actions',      '言葉と行動で積極的に表現',
 '은근하게 행동으로 표현',            'Show it subtly through actions',               'さりげなく行動で示す',
 3),

('romance',
 '연인에게 더 원하는 것은?',          'What do you want more from your partner?',    '恋人に求めるものは？',
 '함께하는 시간',                     'Time spent together',                          '一緒に過ごす時間',
 '서로를 위한 공간',                  'Space for each other',                         'お互いのための空間',
 4),

-- 성격 (personality)
('personality',
 '새로운 사람을 만날 때?',            'When meeting new people?',                    '初対面の人と会うとき？',
 '먼저 다가가는 편',                  'I approach first',                             '自分から話しかける',
 '상대가 다가오면 반응하는 편',       'I respond when they approach',                 '相手が来たら応答する',
 3),

('personality',
 '스트레스를 받으면?',                'When stressed?',                               'ストレスを感じたら？',
 '사람들과 어울리며 풀기',            'Hang out with people',                         '人と交わって発散',
 '혼자만의 시간으로 풀기',            'Have alone time',                              '一人の時間で回復',
 3),

('personality',
 '약속 시간에 대해?',                 'Regarding meeting time?',                     '待ち合わせ時間について？',
 '항상 10분 일찍 도착',               'Always arrive 10 minutes early',               'いつも10分前に到着',
 '딱 맞춰서 가는 편',                 'Arrive right on time',                         'ちょうどに着く',
 2),

('personality',
 '계획이 바뀌었을 때?',               'When plans change?',                          '予定が変わったとき？',
 '유연하게 대처한다',                 'I adapt flexibly',                             '柔軟に対応できる',
 '좀 스트레스를 받는다',              'I get a bit stressed',                         '少しストレスを感じる',
 2),

-- 취향 (taste)
('taste',
 '좋아하는 계절은?',                  'Your favorite season?',                       '好きな季節は？',
 '따뜻한 봄/여름',                   'Warm spring / summer',                         '暖かい春・夏',
 '선선한 가을/겨울',                  'Cool autumn / winter',                         '涼しい秋・冬',
 1),

('taste',
 '영화를 본다면?',                    'If watching a movie?',                         '映画を観るなら？',
 '로맨스/드라마',                     'Romance / Drama',                              'ロマンス・ドラマ',
 '액션/스릴러',                       'Action / Thriller',                            'アクション・スリラー',
 1),

('taste',
 '반려동물을 키운다면?',              'If you had a pet?',                            'ペットを飼うなら？',
 '강아지',                            'Dog',                                          '犬',
 '고양이',                            'Cat',                                          '猫',
 1),

('taste',
 '커피 vs 차?',                       'Coffee vs Tea?',                              'コーヒー派 vs お茶派？',
 '커피파',                            'Coffee person',                                'コーヒー派',
 '차(티)파',                          'Tea person',                                   'お茶派',
 1);
