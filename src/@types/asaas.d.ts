type PixResponse = {
  encodedImage: string;
  payload: string;
  expirationDate: string;
};

type InstallmentOption = {
  installments: number;
  total: number;
  installmentValue: number;
  hasInterest: boolean;
};
