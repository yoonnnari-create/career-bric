export const ADMIN_EMAILS = [
  'yoonnnari@gmail.com', // 나리님의 구글 이메일 주소 등록 완료!
];

export const isAdmin = (email?: string | null) => {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email);
};
