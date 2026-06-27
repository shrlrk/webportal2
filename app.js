// Modal logic
function openModal(modalId) {
    document.getElementById(modalId).classList.add('active');
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
    document.body.style.overflow = '';
}

// Close modals when clicking outside
document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', function(e) {
        if (e.target === this) {
            closeModal(this.id);
        }
    });
});

// Signup Tabs Logic
function switchSignupTab(type) {
    // Update tabs
    const tabs = document.querySelectorAll('.tab-btn');
    tabs.forEach(tab => tab.classList.remove('active'));
    
    if (type === 'student') {
        tabs[0].classList.add('active');
        document.getElementById('signup-student-form').classList.remove('hidden');
        document.getElementById('signup-teacher-form').classList.add('hidden');
    } else {
        tabs[1].classList.add('active');
        document.getElementById('signup-student-form').classList.add('hidden');
        document.getElementById('signup-teacher-form').classList.remove('hidden');
    }
}

// Signup Form Handler
function handleSignup(event) {
    event.preventDefault();
    alert('회원가입 신청이 완료되었습니다. 관리자 승인 대기 상태로 전환됩니다.');
    closeModal('signup-modal');
}

// Terms (Markdown) Logic
const termsData = {
    'terms': {
        title: '이용약관',
        content: `
# 포털 이용약관

## 제1조 (목적)
본 약관은 School Web Portal에서 제공하는 서비스의 이용과 관련하여 포털과 사용자 간의 권리, 의무 및 책임사항을 규정함을 목적으로 합니다.

## 제2조 (용어의 정의)
1. **사용자**: 학생 및 교직원을 의미합니다.
2. **포털**: 본 웹 사이트를 의미합니다.

## 제3조 (서비스의 제공)
포털은 다음과 같은 서비스를 제공합니다:
- 공지사항 열람
- 과제 제출 및 확인
- 성적 조회
- 시간표 확인

*본 약관은 예시입니다.*
`
    },
    'privacy': {
        title: '개인정보처리방침',
        content: `
# 개인정보처리방침

School Web Portal은 사용자의 개인정보를 중요시하며, 안전하게 보호하기 위해 최선을 다하고 있습니다.

## 1. 수집하는 개인정보 항목
- **학생**: 이름, 학번(아이디), 이메일, 비밀번호
- **교사**: 이름, 임용년도(아이디), 이메일, 비밀번호

## 2. 개인정보의 수집 및 이용 목적
- 회원 가입 및 관리
- 서비스 제공 및 본인 인증

## 3. 개인정보의 보유 및 이용 기간
원칙적으로, 개인정보 수집 및 이용 목적이 달성된 후에는 해당 정보를 지체 없이 파기합니다.
`
    },
    'legal': {
        title: '책임의한계와법적고지',
        content: `
# 책임의 한계와 법적 고지

## 책임의 한계
포털에서 제공하는 정보는 참고용이며, 학교의 공식적인 문서나 통지보다 우선하지 않습니다. 
서비스 이용으로 인해 발생하는 직간접적인 손해에 대해 포털은 책임을 지지 않습니다.

## 저작권
본 포털의 모든 콘텐츠(텍스트, 이미지, 디자인 등)에 대한 저작권은 학교 측에 귀속됩니다. 
무단 전재 및 재배포를 금지합니다.
`
    }
};

function openTerms(type) {
    const data = termsData[type];
    if (!data) return;

    document.getElementById('terms-title').innerText = data.title;
    
    // Parse Markdown to HTML using marked.js
    const htmlContent = marked.parse(data.content);
    document.getElementById('terms-content').innerHTML = htmlContent;

    openModal('terms-modal');
}
