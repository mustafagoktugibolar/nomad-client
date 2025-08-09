import React, { useState } from "react";
       import CountrySelector from "./CountrySelector.js";
       import PassportSelector, { Passport } from "./PassportSelector.js";
       import StepNavigation from "./StepNavigation.js";
       import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogAction } from "./ui/alert-dialog.js";
       
       type StepType = "country" | "passport";
       
       // 🚨 Update this interface so onPassportSubmit takes two args
       interface SideSelectorProps {
         onPassportSubmit: (passport: Passport, data: any[]) => void;
         searchTerm: string;
         isVisible: boolean;
         onClose: () => void;
       }
       
       const SideSelector: React.FC<SideSelectorProps> = ({
         onPassportSubmit,
         searchTerm,
         isVisible,
         onClose,
       }) => {
         const [step, setStep] = useState<StepType>("country");
         const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
         const [showComingSoon, setShowComingSoon] = useState(false);
       
         return (
           <div
             className={`
               fixed top-[5.5rem] left-0 md:ml-10 z-50 bg-white shadow-lg rounded-lg
               w-full max-w-[400px] h-[calc(100vh-8rem)]
               transform transition-transform duration-300 ease-in-out
               
              ${isVisible ? "translate-x-0" : "-translate-x-[120%]"}
             `}
           >
             <div className="flex flex-col h-full overflow-hidden p-3 pt-4">
              <StepNavigation step={step} className="mb-2 px-3" />
       
               <div className="relative flex-1 overflow-hidden -mt-2">
                 <div
                   className={`
                     flex w-[200%] h-full transition-transform duration-300 ease-in-out
                     ${step === "passport" ? "-translate-x-1/2" : "translate-x-0"}
                   `}
                 >
                   {/* Country */}
                   <div className="w-1/2 pr-2 ml-2 mr-2 overflow-hidden">
                     <CountrySelector
                       searchTerm={searchTerm}
                       onSelectCountry={(c) => {
                         if (c !== "Turkey") { // Only allow Turkey for now
                           setShowComingSoon(true);
                           return;
                         }
                         setSelectedCountry(c);
                         setStep("passport");
                       }}
                       style={{ height: "100%" }}
                     />
                   </div>
       
                   {/* Passport */}
                   <div className="w-1/2 pl-2 overflow-hidden">
                     {selectedCountry && (
                       // PassportSelector now calls onSubmit(passport, data)
                       <PassportSelector
                         selectedCountry={selectedCountry}
                         onBack={() => setStep("country")}
                         onSubmit={(passport, data) => {
                           onPassportSubmit(passport, data);
                           onClose();
                           // reset for next time
                           setTimeout(() => {
                             setStep("country");
                             setSelectedCountry(null);
                           }, 300);
                         }}
                       />
                     )}
                   </div>
                 </div>
               </div>
             </div>
             {showComingSoon && (
               <AlertDialog open={showComingSoon} onOpenChange={(o)=>setShowComingSoon(o)}>
                 <AlertDialogContent>
                   <AlertDialogHeader>
                     <AlertDialogTitle>Coming Soon</AlertDialogTitle>
                     <AlertDialogDescription>
                       Only Turkey is supported right now. More countries will be added soon.
                     </AlertDialogDescription>
                   </AlertDialogHeader>
                   <AlertDialogFooter>
                     <AlertDialogAction onClick={()=>setShowComingSoon(false)}>OK</AlertDialogAction>
                   </AlertDialogFooter>
                 </AlertDialogContent>
               </AlertDialog>
             )}
           </div>
         );
       };
       
       export default SideSelector;
