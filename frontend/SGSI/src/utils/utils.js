export const emailVerificacao = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

export const formatMilhar = (num) => {
  if (num == null || isNaN(num)) return "";

  const [int, decimos] = num.toString().split(".");
  const formattedInteger = int.replace(/\B(?=(\d{3})+(?!\d))/g, ",");

  return decimos ? `${formattedInteger}.${decimos}` : formattedInteger;
};
