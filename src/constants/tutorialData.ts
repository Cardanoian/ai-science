import type { ResearchStepContent, ChartData } from '../models/types';

const plantChartData: ChartData = {
  id: 'plant-growth-chart',
  type: 'line',
  title: '식물 성장 비교',
  xAxisLabel: '날짜',
  yAxisLabel: '키(cm)',
  data: [
    { name: '1일', value: 2, category: '햇빛 그룹' },
    { name: '3일', value: 4, category: '햇빛 그룹' },
    { name: '5일', value: 7, category: '햇빛 그룹' },
    { name: '7일', value: 10, category: '햇빛 그룹' },
    { name: '1일', value: 2, category: '어둠 그룹' },
    { name: '3일', value: 2.5, category: '어둠 그룹' },
    { name: '5일', value: 3, category: '어둠 그룹' },
    { name: '7일', value: 3.2, category: '어둠 그룹' },
  ],
};

const waterChartData: ChartData = {
  id: 'water-temp-chart',
  type: 'line',
  title: '물 가열 곡선',
  xAxisLabel: '시간(분)',
  yAxisLabel: '온도(°C)',
  data: [
    { name: '0분', value: -5 },
    { name: '2분', value: 0 },
    { name: '4분', value: 0 },
    { name: '6분', value: 50 },
    { name: '8분', value: 100 },
    { name: '10분', value: 100 },
  ],
};

const acidBaseChartData: ChartData = {
  id: 'acid-base-chart',
  type: 'bar',
  title: '용액별 색상 변화',
  xAxisLabel: '용액',
  yAxisLabel: '예상 pH',
  data: [
    { name: '식초', value: 3 },
    { name: '물', value: 7 },
    { name: '비눗물', value: 9 },
  ],
};

const soundChartData: ChartData = {
  id: 'sound-chart',
  type: 'bar',
  title: '소리 크기 비교',
  xAxisLabel: '진동 세기',
  yAxisLabel: '소리 크기 (주관적)',
  data: [
    { name: '약하게 튕기기', value: 2 },
    { name: '보통 세기', value: 5 },
    { name: '세게 튕기기', value: 9 },
  ],
};

export const TUTORIAL_DATA: Record<
  string,
  Record<number, ResearchStepContent>
> = {
  '식물과 빛의 관계': {
    1: {
      researchQuestion: `식물은 정말 햇빛이 있어야만 잘 자랄까?`,
      topicReason: `창가에 둔 화분은 쑥쑥 크는데, 어두운 곳에 둔 식물은 시들시들한 걸 보고 궁금해졌어요.`,
      selectedTopic: '식물과 빛의 관계',
      interests: ['햇빛', '광합성', '식물 키우기'],
    },
    2: {
      observations: [
        '햇빛을 잘 받은 식물은 잎이 초록색이고 튼튼해요.',
        '그늘에 있던 식물은 잎이 노랗고 힘이 없어요.',
      ],
      researchQuestion: '햇빛은 식물이 자라는 데 얼마나 중요할까?',
      hypothesis: {
        condition: '만약 식물에게 햇빛을 많이 보여주면,',
        prediction: '더 튼튼하고 건강하게 자랄 것이다.',
      },
      hypothesisReason:
        '식물은 햇빛으로 밥(양분)을 만들어 먹고 산다고 배웠기 때문이에요.',
    },
    3: {
      materials: [
        '강낭콩 2개',
        '똑같은 화분 2개',
        '흙',
        '물',
        '햇빛이 잘 드는 창가',
        '햇빛을 막는 상자',
        '자',
      ],
      procedure: [
        '두 화분에 흙을 담고 강낭콩을 똑같이 심어요.',
        '화분 하나는 햇빛이 잘 드는 곳에, 다른 하나는 상자를 씌워 어둡게 만들어요.',
        '일주일 동안 매일 똑같은 양의 물을 주고, 키가 얼마나 크는지, 잎 색깔은 어떤지 살펴봐요.',
      ],
      variables: {
        independent: '햇빛의 양',
        dependent: '식물이 자란 키, 잎의 색깔',
        controlled: ['물의 양', '흙의 종류', '화분 크기'],
      },
      safetyPrecautions: [
        '실험이 끝나면 손을 꼭 씻어요.',
        '흙이 눈에 들어가지 않게 조심해요.',
      ],
    },
    4: {
      experimentResults:
        '햇빛을 받은 식물은 7일 동안 8cm 자랐고, 햇빛을 못 받은 식물은 1.2cm밖에 자라지 않았어요. 잎의 색깔도 햇빛을 본 쪽은 진한 초록색, 못 본 쪽은 노란색이었어요.',
      chartData: plantChartData,
      hypothesisResult: 'supported',
      hypothesisExplanation:
        '햇빛을 받은 식물이 훨씬 더 잘 자랐기 때문에, 처음 세웠던 가설이 맞았다고 할 수 있어요.',
      conclusion:
        '실험을 해보니, 식물이 자라는 데 햇빛이 꼭 필요하다는 것을 알 수 있었어요. 햇빛을 많이 받을수록 더 잘 자라요!',
    },
    5: {
      presentationTitle: '햇빛과 식물의 비밀 관계',
      presentationSlides: {
        intro: '안녕하세요! 햇빛과 식물의 비밀 관계를 탐구한 OOO입니다.',
        motivation:
          '햇빛을 못 본 식물이 시들시들한 것을 보고, 햇빛이 식물에게 얼마나 중요한지 궁금해서 실험을 시작했습니다.',
        questionHypothesis:
          '저의 탐구 질문은 "햇빛은 식물이 자라는 데 얼마나 중요할까?"였고, "햇빛을 많이 보여주면 더 튼튼하게 자랄 것"이라고 예상했습니다.',
        method:
          '똑같은 식물 두 개를 하나는 햇빛 아래, 하나는 어두운 상자 안에 두고 일주일 동안 키와 잎 색깔을 관찰했습니다.',
        results:
          '결과는 놀라웠습니다! 햇빛을 본 식물은 쑥쑥 자랐지만, 햇빛을 못 본 식물은 거의 자라지 못하고 노랗게 변했습니다.',
        conclusion:
          '결론적으로, 식물에게 햇빛은 최고의 영양제라는 것을 알게 되었습니다. 발표를 들어주셔서 감사합니다!',
      },
      presentationScript:
        '안녕하세요! 지금부터 저희의 신기한 식물 실험 이야기를 들려드릴게요. 햇빛이 식물에게 얼마나 중요한지 알아보는 실험이었답니다...',
    },
    6: {
      whatLearned:
        '스스로 조건을 다르게 해서 실험을 계획하고 결과를 직접 확인한 것이 가장 뿌듯했어요.',
      challenges: '매일 똑같은 시간에 물을 주는 걸 깜빡할 뻔했어요.',
      newLearnings:
        '식물이 광합성을 한다는 어려운 말을 직접 눈으로 확인해서 신기했어요. 과학은 책으로만 배우는 게 아니라 직접 해보는 게 중요하다는 걸 알았어요.',
      nextResearch: '햇빛 말고, 비료를 주면 얼마나 더 잘 자랄지 궁금해요!',
      aiExperience: {
        positive: 'AI가 어려운 용어를 쉽게 설명해줘서 좋았어요.',
        improvement:
          '다음에는 AI에게 더 구체적으로 질문해서 아이디어를 얻고 싶어요.',
      },
    },
  },
  '물의 상태 변화': {
    1: {
      researchQuestion: '물은 어떻게 얼음, 김으로 변신할까?',
      topicReason:
        '아이스크림이 녹고, 라면 물이 끓는 걸 보고 물의 변신이 궁금해졌어요.',
      selectedTopic: '물의 상태 변화',
      interests: ['얼음', '수증기', '온도'],
    },
    2: {
      observations: [
        '냉동실에 넣은 물은 꽁꽁 얼어요.',
        '물을 끓이면 김이 모락모락 나요.',
        '차가운 콜라병에 물방울이 생겨요.',
      ],
      researchQuestion: '온도를 바꾸면 물은 어떻게 변할까?',
      hypothesis: {
        condition: '만약 물을 뜨겁게 하거나 차갑게 하면,',
        prediction: '물, 수증기, 얼음으로 모습을 바꿀 것이다.',
      },
      hypothesisReason:
        '온도에 따라 물 알갱이(분자)들이 움직이는 모습이 달라지기 때문이에요.',
    },
    3: {
      materials: ['물', '냄비', '가스레인지', '온도계', '얼음틀', '냉동실'],
      procedure: [
        '얼음틀에 물을 넣고 냉동실에서 얼려봐요.',
        '냄비에 물을 넣고 끓이면서 김(수증기)이 나는 걸 살펴봐요.',
        '얼음을 꺼내서 녹는 모습을 지켜봐요.',
      ],
      variables: {
        independent: '온도',
        dependent: '물의 모습(얼음, 물, 김)',
        controlled: ['물의 양'],
      },
      safetyPrecautions: [
        '뜨거운 물이나 냄비를 만질 때는 어른께 도와달라고 해요.',
        '가스레인지를 쓸 때는 꼭 어른과 함께 해요.',
      ],
    },
    4: {
      experimentResults:
        '물을 0도보다 낮은 냉동실에 넣으니 딱딱한 얼음이 되었어요. 이걸 다시 꺼내니 물이 되었고, 100도까지 끓이니 김이 되어 날아갔어요.',
      chartData: waterChartData,
      hypothesisResult: 'supported',
      hypothesisExplanation:
        '온도를 바꾸니 정말 물이 얼음이나 김으로 변했어요. 제 가설이 맞았어요!',
      conclusion:
        '온도를 바꾸면 물은 얼음, 물, 김으로 자유롭게 변신할 수 있어요. 정말 신기해요!',
    },
    5: {
      presentationTitle: '물의 변신 마술쇼!',
      presentationSlides: {
        intro: '안녕하세요! 물의 변신 마술쇼에 오신 여러분을 환영합니다.',
        motivation:
          '물이 얼음도 되고, 김도 되는 게 신기해서 마술의 비밀을 파헤쳐 보기로 했습니다.',
        questionHypothesis:
          '"온도를 바꾸면 물은 어떻게 변할까?" 궁금했고, "뜨겁게 하면 김, 차갑게 하면 얼음이 될 것"이라고 생각했어요.',
        method:
          '물을 얼리고, 녹이고, 끓여보면서 온도에 따라 어떻게 변하는지 관찰했습니다.',
        results:
          '정말로 물은 온도가 낮으면 얼음, 높으면 김으로 변신했어요! 정말 멋진 마술이죠?',
        conclusion:
          '결론적으로, 물의 변신 마술의 비밀은 바로 온도였습니다! 제 마술쇼를 봐주셔서 고맙습니다.',
      },
      presentationScript:
        '여러분, 지금부터 물의 놀라운 변신 마술쇼를 보여드릴게요! 물이 어떻게 변하는지 함께 알아볼까요?...',
    },
    6: {
      whatLearned:
        '물이 세 가지 모습으로 변하는 것을 직접 본 것이 가장 재미있었어요.',
      challenges: '물이 끓어서 김으로 변할 때까지 기다리는 게 조금 지루했어요.',
      newLearnings:
        '물이 얼거나 끓을 때 온도가 한동안 변하지 않는다는 것을 새롭게 알게 되었어요.',
      nextResearch: '물에 소금을 넣고 얼리면 어떻게 될지 궁금해요.',
      aiExperience: {
        positive: 'AI 덕분에 어려운 ‘분자’라는 말을 조금 이해하게 됐어요.',
        improvement:
          '다음엔 AI에게 실험 과정을 물어봐서 더 재미있는 실험을 하고 싶어요.',
      },
    },
  },
  '산성과 염기성': {
    1: {
      researchQuestion:
        '우리 주변에 신맛, 쓴맛을 내는 것들은 어떤 비밀이 있을까?',
      topicReason:
        '보라색 양배추로 용액의 색깔을 바꾸는 마술 같은 실험을 보고, 직접 해보고 싶어졌어요.',
      selectedTopic: '산성과 염기성',
      interests: ['레몬', '비누', '색깔 변화'],
    },
    2: {
      observations: [
        '레몬은 엄청 셔요.',
        '비눗물은 미끌미끌하고 맛보면 써요.',
        '사이다는 톡 쏘는 맛이 나요.',
      ],
      researchQuestion:
        '보라색 양배추 물은 여러 가지 액체를 만나면 어떻게 색이 변할까?',
      hypothesis: {
        condition: '만약 신맛 나는 액체에 양배추 물을 넣으면,',
        prediction:
          '붉은색으로 변하고, 미끌거리는 액체에 넣으면 푸른색으로 변할 것이다.',
      },
      hypothesisReason:
        '맛이나 느낌에 따라 액체의 성질이 다르고, 양배추 물이 그 성질을 색깔로 보여줄 것 같아요.',
    },
    3: {
      materials: [
        '보라색 양배추',
        '물',
        '식초',
        '사이다',
        '비눗물',
        '레몬즙',
        '투명한 컵 여러 개',
      ],
      procedure: [
        '보라색 양배추를 우려서 마법 물약(지시약)을 만들어요.',
        '투명한 컵에 식초, 사이다, 비눗물 등을 조금씩 담아요.',
        '각 컵에 마법 물약을 몇 방울 떨어뜨리고 색깔이 어떻게 변하는지 봐요.',
      ],
      variables: {
        independent: '컵에 담긴 액체의 종류',
        dependent: '마법 물약의 색깔 변화',
        controlled: ['마법 물약의 양'],
      },
      safetyPrecautions: [
        '실험에 쓴 액체를 절대 마시면 안 돼요.',
        '실험이 끝나면 주변을 깨끗하게 정리해요.',
      ],
    },
    4: {
      experimentResults:
        '식초와 레몬즙에 양배추 물을 넣으니 예쁜 붉은색이 되었어요. 비눗물에 넣었더니 푸른색으로 변해서 신기했어요. 그냥 물은 아무 변화가 없었어요.',
      chartData: acidBaseChartData,
      hypothesisResult: 'supported',
      hypothesisExplanation:
        '신맛 나는 것들은 붉은색, 미끌거리는 것은 푸른색으로 변할 거라는 제 예상이 딱 맞았어요!',
      conclusion:
        '보라색 양배추 물로 신맛 나는 산성 친구들과 미끌거리는 염기성 친구들을 구별할 수 있었어요!',
    },
    5: {
      presentationTitle: '색깔 마법사 양배추',
      presentationSlides: {
        intro:
          '안녕하세요! 우리 주변 액체들의 진짜 정체를 밝히는 마법사, OOO입니다.',
        motivation:
          '보라색 양배추만 있으면 색깔 마법을 부릴 수 있다고 해서, 직접 해보기로 마음먹었어요.',
        questionHypothesis:
          '"양배추 물이 액체를 만나면 어떻게 변할까?" 궁금했고, "신맛은 빨강, 쓴맛은 파랑으로 변할 것"이라고 생각했어요.',
        method:
          '양배추로 마법 물약을 만들고, 식초, 비눗물 등 여러 액체에 떨어뜨려 보았습니다.',
        results:
          '결과는 대성공! 식초는 빨갛게, 비눗물은 파랗게 변했어요. 정말 신기한 마법이었어요!',
        conclusion:
          '결론적으로, 양배추 마법 물약으로 산성, 염기성 친구들을 쉽게 구별할 수 있었습니다. 감사합니다!',
      },
      presentationScript:
        '여러분, 제가 오늘 색깔 마법을 보여드릴게요! 이 보라색 물약만 있으면 뭐든지 색을 바꿀 수 있답니다...',
    },
    6: {
      whatLearned:
        '스스로 마법 물약을 만들어서 여러 가지 색깔 변화를 본 것이 가장 기억에 남아요.',
      challenges: '비눗물을 만들 때 거품이 너무 많이 나서 힘들었어요.',
      newLearnings:
        '우리 주변에 산성, 염기성이라는 다른 성질을 가진 것들이 많다는 걸 알게 됐어요.',
      nextResearch: '산성 액체랑 염기성 액체를 섞으면 어떻게 될지 궁금해요.',
      aiExperience: {
        positive:
          'AI가 ‘지시약’이 뭔지 알려줘서 실험을 더 잘 이해할 수 있었어요.',
        improvement: '다음엔 AI에게 다른 지시약 종류도 물어봐야겠어요.',
      },
    },
  },
  '소리의 진동': {
    1: {
      researchQuestion: '소리는 어떻게 내 귀까지 날아올까?',
      topicReason:
        '기타를 칠 때 줄이 떨리는 걸 보고, 소리가 떨림과 관련이 있는지 궁금해졌어요.',
      selectedTopic: '소리의 진동',
      interests: ['기타', '북', '목소리'],
    },
    2: {
      observations: [
        '목에 손을 대고 "아~" 소리를 내면 목이 떨려요.',
        '북을 치면 북 가죽이 흔들리는 게 보여요.',
        '멀리서 부르면 소리가 작게 들려요.',
      ],
      researchQuestion: '물체의 떨림과 소리는 어떤 관계가 있을까?',
      hypothesis: {
        condition: '만약 물체를 세게, 그리고 빠르게 진동시키면,',
        prediction:
          '진폭이 커져 더 큰 소리가 나고, 진동수가 높아져 더 높은 소리가 날 것이다.',
      },
      hypothesisReason:
        '소리가 떨림으로 만들어지는 거라면, 떨림의 크기나 빠르기에 따라 소리도 달라질 것 같아요.',
    },
    3: {
      materials: [
        '고무줄',
        '빈 과자 상자',
        '소리굽쇠',
        '물이 담긴 그릇',
        '여러 가지 길이의 플라스틱 자',
      ],
      procedure: [
        '과자 상자에 고무줄을 걸고 살살 튕겨보고, 세게도 튕겨봐요.',
        '자를 책상 끝에 놓고 길이를 다르게 해서 튕겨봐요.',
        '소리굽쇠를 살짝 쳐서 떨리게 한 다음, 물에 넣어봐요.',
      ],
      variables: {
        independent: '떨리는 세기와 빠르기',
        dependent: '소리의 크기와 높낮이',
        controlled: ['실험하는 장소'],
      },
      safetyPrecautions: [
        '자를 튕길 때 눈에 맞지 않게 조심해요.',
        '소리굽쇠를 너무 세게 치지 않아요.',
      ],
    },
    4: {
      experimentResults:
        '고무줄을 세게 튕기니깐 더 큰 소리가 났고, 짧은 자를 튕기니깐 더 높은 소리가 났어요. 떨리는 소리굽쇠를 물에 넣었더니 물이 파르르 떨리면서 튀어 올라서 깜짝 놀랐어요!',
      chartData: soundChartData,
      hypothesisResult: 'supported',
      hypothesisExplanation:
        '세게 떨면 큰 소리, 빨리 떨면 높은 소리가 날 거라는 제 예상이 맞았어요. 소리는 떨림으로 만들어지는 게 확실해요.',
      conclusion:
        '소리는 물체의 떨림 때문에 생겨요! 세게 떨리면 큰 소리, 빨리 떨리면 높은 소리가 나요.',
    },
    5: {
      presentationTitle: '소리의 비밀을 찾아서!',
      presentationSlides: {
        intro: '안녕하세요! 소리의 비밀을 찾아 떠난 탐험가, OOO입니다.',
        motivation:
          '목소리를 낼 때 목이 떨리는 게 신기해서, 소리의 정체를 밝혀내기로 결심했습니다.',
        questionHypothesis:
          '"물체의 떨림과 소리는 어떤 관계가 있을까?" 궁금했고, "떨림이 클수록 소리도 클 것"이라고 예상했어요.',
        method:
          '고무줄, 자, 소리굽쇠를 이용해서 다양한 떨림과 소리를 만들어보는 실험을 했습니다.',
        results:
          '실험 결과, 모든 소리는 떨림으로부터 만들어진다는 것을 발견했습니다! 세게 떨릴수록 소리가 컸어요.',
        conclusion:
          '결론적으로, 소리의 비밀은 바로 "떨림"이었습니다! 제 발표를 들어주셔서 감사합니다.',
      },
      presentationScript:
        '안녕하세요! 제가 발견한 소리의 엄청난 비밀을 알려드릴게요. 소리는 사실 눈에 보이지 않는 떨림이랍니다...',
    },
    6: {
      whatLearned:
        '소리의 크기와 높낮이가 떨림의 세기와 빠르기에 따라 달라진다는 것을 확실히 알게 됐어요.',
      challenges: '소리굽쇠를 계속 치는 게 팔이 아팠어요.',
      newLearnings:
        '소리가 물에 닿으면 물결이 생기는 것을 보고, 소리가 힘(에너지)을 가지고 있다는 것을 알게 되었어요.',
      nextResearch:
        '방 안에서 말할 때랑 운동장에서 말할 때 소리가 어떻게 다른지 궁금해요.',
      aiExperience: {
        positive:
          'AI가 ‘진동수’ 같은 어려운 말을 쉽게 풀어서 설명해줘서 좋았어요.',
        improvement:
          '다음엔 AI에게 더 재미있는 소리 실험 아이디어를 물어보고 싶어요.',
      },
    },
  },
};
