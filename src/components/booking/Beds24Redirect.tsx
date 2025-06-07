
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, ExternalLink } from "lucide-react";

type Beds24RedirectProps = {
  propertyId: string;
  checkInDate?: string;
  checkOutDate?: string;
  guests?: number;
  voucherCode?: string;
  onClose: () => void;
};

const Beds24Redirect = ({
  propertyId,
  checkInDate,
  checkOutDate,
  guests = 1,
  voucherCode,
  onClose,
}: Beds24RedirectProps) => {
  const [countdown, setCountdown] = useState(5);
  const navigate = useNavigate();
  
  // In a real application, this would be your Beds24 URL with the property ID and other parameters
  const beds24Url = `https://beds24.com/booking.php?propid=${propertyId}` +
    (checkInDate ? `&checkin=${checkInDate}` : '') +
    (checkOutDate ? `&checkout=${checkOutDate}` : '') +
    (guests ? `&guests=${guests}` : '') +
    (voucherCode ? `&voucher=${voucherCode}` : '');
  
  useEffect(() => {
    // Countdown timer
    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      // In a real app, this would redirect to Beds24
      // For the demo, we'll just simulate it
      console.log("Redirecting to Beds24:", beds24Url);
    }
  }, [countdown, beds24Url]);

  const handleRedirectNow = () => {
    // In a real app, this would redirect to Beds24
    console.log("Manual redirect to Beds24:", beds24Url);
    
    // Simulate a successful booking after redirect
    setTimeout(() => {
      // Navigate back to the home page after simulated booking
      navigate("/");
      onClose();
    }, 1000);
  };
  
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle>Redirecting to Payment</CardTitle>
        <CardDescription>
          You are being redirected to Beds24 to complete your booking
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-center my-6">
          <div className="w-16 h-16 rounded-full bg-airbnb-primary/10 flex items-center justify-center">
            <Loader2 className="h-8 w-8 text-airbnb-primary animate-spin" />
          </div>
        </div>
        
        <div className="text-center">
          <p className="text-sm text-airbnb-light">
            Redirecting in {countdown} seconds...
          </p>
        </div>
        
        {voucherCode && (
          <div className="bg-green-50 border border-green-100 rounded-md p-4 text-center">
            <p className="text-sm text-green-800 font-medium">Discount Applied!</p>
            <p className="text-xs text-green-600 mt-1">
              Voucher code: {voucherCode}
            </p>
          </div>
        )}
        
        <div className="border rounded-md p-4">
          <h4 className="text-sm font-medium mb-2">Booking Details</h4>
          <div className="space-y-1 text-sm">
            <p><span className="text-airbnb-light">Property ID:</span> {propertyId}</p>
            {checkInDate && <p><span className="text-airbnb-light">Check-in:</span> {checkInDate}</p>}
            {checkOutDate && <p><span className="text-airbnb-light">Check-out:</span> {checkOutDate}</p>}
            <p><span className="text-airbnb-light">Guests:</span> {guests}</p>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={handleRedirectNow} className="flex items-center gap-2">
          <ExternalLink className="h-4 w-4" />
          Go to Payment Now
        </Button>
      </CardFooter>
    </Card>
  );
};

export default Beds24Redirect;
