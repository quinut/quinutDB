import React from 'react';
import { ArrowLeft, Shield, CheckCircle2, Lock, Mail, Globe, ExternalLink } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

export interface PrivacyPageProps {
  onNavigateHome: () => void;
}

export const PrivacyPage: React.FC<PrivacyPageProps> = ({ onNavigateHome }) => {
  const { language, toggleLanguage } = useLanguage();

  return (
    <div className="min-h-screen bg-[#f5f5f5] text-[#0a0a0a] flex flex-col antialiased">
      {/* 1. Top Navbar */}
      <header className="sticky top-0 z-30 w-full border-b border-[#e5e5e5] bg-[#ffffff]/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-[960px] items-center justify-between px-4 sm:px-6 py-3.5">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onNavigateHome}
              className="inline-flex items-center gap-1.5 rounded-[18px] border border-[#e5e5e5] bg-[#fafafa] px-3 py-1.5 text-[12px] font-medium text-[#0a0a0a] hover:bg-[#e5e5e5] transition-colors cursor-pointer"
            >
              <ArrowLeft size={14} />
              <span>{language === 'ko' ? '홈으로 돌아가기' : 'Back to Home'}</span>
            </button>
            <div className="h-4 w-px bg-[#e5e5e5] hidden sm:block" />
            <a
              href="/"
              onClick={(e) => {
                e.preventDefault();
                onNavigateHome();
              }}
              className="flex items-center gap-2 text-[15px] font-semibold text-[#0a0a0a]"
            >
              <img
                src="/icon.png"
                alt="quinutDB"
                className="h-6 w-6 rounded-[6px] border border-[#e5e5e5]"
              />
              <span>quinutDB</span>
            </a>
          </div>

          <button
            type="button"
            onClick={toggleLanguage}
            className="inline-flex h-[34px] items-center gap-1.5 rounded-[18px] border border-[#e5e5e5] bg-[#fafafa] px-3 text-[12px] font-semibold text-[#0a0a0a] hover:bg-[#e5e5e5] transition-colors cursor-pointer"
          >
            <Globe size={13} className="text-[#737373]" />
            <span>{language === 'ko' ? 'EN' : '한국어'}</span>
          </button>
        </div>
      </header>

      {/* 2. Main Content */}
      <main className="flex-1 w-full max-w-[960px] mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="rounded-[24px] border border-[#e5e5e5] bg-[#ffffff] p-6 sm:p-10 shadow-[0_0_0_1px_rgba(23,23,23,0.04),0_8px_30px_rgba(0,0,0,0.06)] flex flex-col gap-8">
          {/* Header Title */}
          <div className="flex flex-col gap-2 pb-6 border-b border-[#f0f0f0]">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#fafafa] border border-[#e5e5e5] px-2.5 py-0.5 text-[11px] font-medium text-[#0a0a0a]">
                <Shield size={13} className="text-[#0a0a0a]" />
                <span>{language === 'ko' ? '프라이버시 정책' : 'Privacy Protection'}</span>
              </span>
              <span className="text-[11px] text-[#737373]">
                {language === 'ko' ? '시행일자: 2026년 9월 15일' : 'Effective Date: September 15, 2026'}
              </span>
            </div>
            <h1 className="text-[24px] sm:text-[28px] font-bold tracking-tight text-[#0a0a0a]">
              {language === 'ko' ? '개인정보처리방침' : 'Privacy Policy'}
            </h1>
            <p className="text-[13px] sm:text-[14px] text-[#737373] leading-relaxed">
              {language === 'ko'
                ? 'quinutDB (이하 "서비스")는 이용자의 개인정보를 매우 소중하게 생각하며, 관련 법령(개인정보 보호법 등)을 준수하고 이용자의 프라이버시 권리를 보장하기 위해 다음과 같은 처리방침을 수립·운영하고 있습니다.'
                : 'quinutDB (the "Service") values your privacy and is committed to protecting your personal data in accordance with applicable data protection laws.'}
            </p>
          </div>

          {/* Privacy Key Highlights Card */}
          <div className="rounded-[18px] bg-[#fafafa] border border-[#e5e5e5] p-5 flex flex-col gap-3">
            <h2 className="text-[13px] font-semibold text-[#0a0a0a] flex items-center gap-1.5">
              <Lock size={15} className="text-[#0a0a0a]" />
              <span>{language === 'ko' ? 'quinutDB의 3대 프라이버시 핵심 원칙' : 'Three Core Privacy Principles of quinutDB'}</span>
            </h2>
            <ul className="flex flex-col gap-2 text-[12.5px] text-[#525252]">
              <li className="flex items-start gap-2">
                <CheckCircle2 size={15} className="text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <strong>{language === 'ko' ? 'Google 실명 및 프로필 사진 일절 미수집' : 'No Collection of Real Name or Photo'}:</strong>{' '}
                  {language === 'ko'
                    ? 'Google 로그인 시 오직 openid와 email 스코프만 요청하며, 사용자의 구글 실명과 프로필 사진은 일절 요구하거나 데이터베이스에 저장하지 않습니다.'
                    : 'We only request openid and email scopes. Your Google real name and profile picture are never requested, accessed, or stored.'}
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 size={15} className="text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <strong>{language === 'ko' ? 'Boring Avatars 기반 익명화 프로필' : 'Boring Avatars Anonymization'}:</strong>{' '}
                  {language === 'ko'
                    ? '프로필 이미지는 Boring Avatars 라이브러리를 통해 생성되며, 이메일 평문이 아닌 서비스 내부 고유 식별자(ID)를 시드로 사용하여 개인정보 유출을 방지합니다.'
                    : 'Avatars are generated via Boring Avatars using random internal identifiers, ensuring plain email addresses are never exposed.'}
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 size={15} className="text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <strong>{language === 'ko' ? '상업적 판매 및 제3자 마케팅 절대 금지' : 'No Commercial Sale or Marketing Tracking'}:</strong>{' '}
                  {language === 'ko'
                    ? '광고 트래커를 설치하지 않으며, 이용자의 데이터를 영리 목적으로 판매하거나 제3자에게 제공하지 않습니다.'
                    : 'We do not run third-party advertising trackers, nor do we sell or monetize your data.'}
                </span>
              </li>
            </ul>
          </div>

          {/* Section List */}
          <div className="flex flex-col gap-8 text-[13.5px] text-[#262626] leading-relaxed">
            {/* 1. 수집하는 개인정보 항목 */}
            <section className="flex flex-col gap-2.5">
              <h3 className="text-[16px] font-bold text-[#0a0a0a] tracking-tight">
                {language === 'ko' ? '1. 수집하는 개인정보 항목 및 수집 방법' : '1. Information We Collect and Methods'}
              </h3>
              <p className="text-[#525252]">
                {language === 'ko'
                  ? '서비스는 회원가입 및 로그인, 커뮤니티 리뷰 작성을 위해 필요한 최소한의 정보만을 수집합니다.'
                  : 'We collect only the minimum personal data necessary for authentication and community reviews.'}
              </p>
              <div className="overflow-x-auto rounded-[14px] border border-[#e5e5e5] mt-1">
                <table className="w-full text-left text-[12.5px]">
                  <thead className="bg-[#fafafa] border-b border-[#e5e5e5] text-[#0a0a0a] font-semibold">
                    <tr>
                      <th className="p-3">{language === 'ko' ? '구분' : 'Category'}</th>
                      <th className="p-3">{language === 'ko' ? '수집 항목' : 'Collected Items'}</th>
                      <th className="p-3">{language === 'ko' ? '수집 목적' : 'Purpose'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#f0f0f0] text-[#525252]">
                    <tr>
                      <td className="p-3 font-medium text-[#0a0a0a]">Google OAuth</td>
                      <td className="p-3">
                        {language === 'ko'
                          ? '고유 식별자(sub/ID), 이메일 주소 (※ 실명 및 구글 프로필 사진 제외)'
                          : 'OAuth ID (sub), Email address (Excludes real name & photo)'}
                      </td>
                      <td className="p-3">
                        {language === 'ko' ? '사용자 로그인 및 계정 식별' : 'User authentication & account identification'}
                      </td>
                    </tr>
                    <tr>
                      <td className="p-3 font-medium text-[#0a0a0a]">GitHub OAuth</td>
                      <td className="p-3">
                        {language === 'ko'
                          ? '고유 식별자(ID), GitHub 핸들명, 이메일 주소'
                          : 'OAuth ID, GitHub username, Email address'}
                      </td>
                      <td className="p-3">
                        {language === 'ko' ? '사용자 로그인 및 계정 식별' : 'User authentication & account identification'}
                      </td>
                    </tr>
                    <tr>
                      <td className="p-3 font-medium text-[#0a0a0a]">
                        {language === 'ko' ? '서비스 내 생성 정보' : 'Service Data'}
                      </td>
                      <td className="p-3">
                        {language === 'ko'
                          ? '이용자가 설정한 활동 닉네임, 유저 평점(1~5점) 및 리뷰 텍스트'
                          : 'Custom nickname, Community user score (1-5), Review text'}
                      </td>
                      <td className="p-3">
                        {language === 'ko' ? '커뮤니티 평가 제공 및 닉네임 표기' : 'Community display & user curation score'}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            {/* 2. 개인정보의 이용 목적 */}
            <section className="flex flex-col gap-2.5">
              <h3 className="text-[16px] font-bold text-[#0a0a0a] tracking-tight">
                {language === 'ko' ? '2. 개인정보의 이용 목적' : '2. Purpose of Using Personal Data'}
              </h3>
              <p className="text-[#525252]">
                {language === 'ko'
                  ? '수집된 개인정보는 다음 목적 이외의 용도로는 이용되지 않으며, 목적이 변경될 경우 사전에 동의를 구할 예정입니다.'
                  : 'Personal data collected is used solely for the following purposes:'}
              </p>
              <ul className="list-disc pl-5 space-y-1 text-[#525252]">
                <li>{language === 'ko' ? '비밀번호 없는 안전한 OAuth 소셜 로그인 및 세션 관리' : 'Passwordless OAuth authentication & session management'}</li>
                <li>{language === 'ko' ? '커뮤니티 평가(userScore) 및 리뷰의 중복 작성 방지 및 작성자 식별' : 'Prevention of review manipulation and author attribution'}</li>
                <li>{language === 'ko' ? '비정상적 접근 및 어뷰징 방지를 통한 안전한 서비스 운영' : 'Security, abuse prevention, and service stability'}</li>
              </ul>
            </section>

            {/* 3. 보유 및 이용 기간 */}
            <section className="flex flex-col gap-2.5">
              <h3 className="text-[16px] font-bold text-[#0a0a0a] tracking-tight">
                {language === 'ko' ? '3. 개인정보의 보유 및 이용 기간' : '3. Data Retention and Deletion'}
              </h3>
              <p className="text-[#525252]">
                {language === 'ko'
                  ? '이용자의 개인정보는 원칙적으로 이용자가 회원 탈퇴를 요청하거나 개인정보 삭제를 요청할 때까지 보유 및 이용됩니다. 탈퇴 또는 삭제 요청 시 데이터는 지체 없이 완전히 영구 삭제됩니다.'
                  : 'Personal data is retained until the user requests account deletion. Upon request, all associated records are permanently erased without delay.'}
              </p>
            </section>

            {/* 4. 개인정보의 제3자 제공 및 위탁 */}
            <section className="flex flex-col gap-2.5">
              <h3 className="text-[16px] font-bold text-[#0a0a0a] tracking-tight">
                {language === 'ko' ? '4. 개인정보의 제3자 제공 및 업무 위탁' : '4. Third-Party Sharing and Service Providers'}
              </h3>
              <p className="text-[#525252]">
                {language === 'ko'
                  ? '서비스는 이용자의 개인정보를 제3자에게 무단 제공하거나 판매하지 않습니다. 단, 서비스의 원활한 기술적 제공을 위해 아래와 같은 클라우드 인프라 제공업체를 이용합니다.'
                  : 'We do not sell or disclose your data to third parties. We utilize trusted cloud infrastructure providers strictly to operate the service:'}
              </p>
              <div className="p-3.5 rounded-[14px] bg-[#fafafa] border border-[#e5e5e5] text-[12.5px]">
                <div><strong>{language === 'ko' ? '위탁 대상' : 'Provider'}:</strong> Supabase Inc.</div>
                <div><strong>{language === 'ko' ? '위탁 업무 내용' : 'Purpose'}:</strong> {language === 'ko' ? '클라우드 데이터베이스 저장 및 OAuth 인증 인프라 제공' : 'Cloud database hosting & authentication infrastructure'}</div>
              </div>
            </section>

            {/* 5. 이용자의 권리와 행사 방법 */}
            <section className="flex flex-col gap-2.5">
              <h3 className="text-[16px] font-bold text-[#0a0a0a] tracking-tight">
                {language === 'ko' ? '5. 이용자의 권리와 행사 방법' : '5. Your Privacy Rights'}
              </h3>
              <p className="text-[#525252]">
                {language === 'ko'
                  ? '이용자는 언제든지 자신의 개인정보에 대해 다음 권리를 행사할 수 있습니다.'
                  : 'Users can exercise the following rights at any time:'}
              </p>
              <ul className="list-disc pl-5 space-y-1 text-[#525252]">
                <li>
                  <strong>{language === 'ko' ? '닉네임 변경' : 'Nickname Modification'}:</strong>{' '}
                  {language === 'ko' ? '사이트 우측 상단 프로필 메뉴의 [닉네임 변경]을 통해 즉시 수정 가능' : 'Freely update your display nickname via Profile > Edit Nickname'}
                </li>
                <li>
                  <strong>{language === 'ko' ? '리뷰 수정 및 삭제' : 'Review Management'}:</strong>{' '}
                  {language === 'ko' ? '각 아이템 상세 페이지에서 본인이 작성한 평점 및 코멘트 즉시 삭제 가능' : 'Delete or edit your ratings and reviews directly in the modal'}
                </li>
                <li>
                  <strong>{language === 'ko' ? '계정 완전 삭제 및 탈퇴' : 'Account Erasure'}:</strong>{' '}
                  {language === 'ko' ? '아래 문의 이메일로 요청 시 등록된 계정 및 프로필 데이터를 즉시 파기합니다.' : 'Email us at quinut@proton.me to completely delete your account.'}
                </li>
              </ul>
            </section>

            {/* 6. 개인정보 보호책임자 및 문의처 */}
            <section className="flex flex-col gap-2.5 pt-4 border-t border-[#f0f0f0]">
              <h3 className="text-[16px] font-bold text-[#0a0a0a] tracking-tight">
                {language === 'ko' ? '6. 개인정보 보호책임자 및 문의처' : '6. Contact and Data Protection Officer'}
              </h3>
              <p className="text-[#525252]">
                {language === 'ko'
                  ? '개인정보 보호와 관련된 모든 문의, 불만 처리 및 삭제 요청은 아래 연락처로 문의해 주시기 바랍니다.'
                  : 'For any inquiries, requests, or privacy concerns, please contact us:'}
              </p>
              <div className="rounded-[16px] border border-[#e5e5e5] bg-[#fafafa] p-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#0a0a0a] text-[#ffffff] shrink-0">
                    <Mail size={16} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[13px] font-semibold text-[#0a0a0a]">quinut</span>
                    <a
                      href="mailto:quinut@proton.me"
                      className="text-[12px] text-[#525252] hover:text-[#0a0a0a] transition-colors underline"
                    >
                      quinut@proton.me
                    </a>
                  </div>
                </div>
                <a
                  href="https://github.com/quinut/quinutDB"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-[12px] font-medium text-[#737373] hover:text-[#0a0a0a] transition-colors"
                >
                  <span>GitHub</span>
                  <ExternalLink size={12} />
                </a>
              </div>
            </section>
          </div>
        </div>
      </main>

      {/* 3. Footer */}
      <footer className="w-full border-t border-[#e5e5e5] bg-[#ffffff] py-6 text-center text-[13px] text-[#737373]">
        <div className="mx-auto max-w-[960px] px-6 flex items-center justify-between">
          <span>&copy; {new Date().getFullYear()} quinutDB (db.quinut.xyz)</span>
          <button
            type="button"
            onClick={onNavigateHome}
            className="text-[12px] text-[#0a0a0a] hover:underline cursor-pointer"
          >
            {language === 'ko' ? '홈으로 돌아가기' : 'Back to Home'}
          </button>
        </div>
      </footer>
    </div>
  );
};

export default PrivacyPage;
