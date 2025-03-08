"use ciient";
import { usePaystackPayment } from "react-paystack";

interface PaystackButtonProps {
  email: string;
  onSuccess: () => void;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
}

const PaystackButton = ({
  email,
  onSuccess,
  onClose,
  children,
  className,
  ...props
}: PaystackButtonProps) => {
  const paystackConfig = {
    reference: new Date().getTime().toString(),
    email,
    amount: 210000, //Amount is in the country's lowest currency. E.g Kobo, so 20000 kobo = N200
    publicKey: process.env.NEXT_PUBLIC_PAYSTACK_PUBLICKEY!,
  };

  const initializePayment = usePaystackPayment(paystackConfig);

  return (
    <button
      onClick={() =>
        initializePayment({
          onSuccess,
          onClose,
        })
      }
      className={className}
      {...props}
    >
      {children}
    </button>
  );
};

export default PaystackButton;
