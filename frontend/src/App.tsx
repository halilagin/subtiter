import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import LandingPage from '@/pages/landingpage/LandingPage';
import Dashboard from '@/pages/dashboard/dashboard/Dashboard';
import { Account } from '@/pages/dashboard/account';
// import { Usage } from '@/pages/dashboard/usage';
import { Billing } from '@/pages/dashboard/billing';
import OuterLayout from './pages/_layout/OuterLayout';
import InnerProtectedLayout from './pages/_layout/InnerLayout';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import OuterLoginLayout from './pages/_layout/OuterLoginLayout';
import PricingPage from './pages/pricing/PricingPage';
import Payment from './pages/pricing/payment/Payment';
import ListShortsPage from './pages/ListShortsPage';
import ListEmbeddedSubtitlesPage from './pages/ListEmbeddedSubtitlesPage';
import CreateAccountPage from './pages/auth/CreateAccount';
import ManageSubscription from './pages/dashboard/managesubscription/ManageSubscription';
import PayForUpgrade from './pages/pricing/pay-for-upgrade/PayForUpgrade';
import ApplyPromotionCode from './pages/dashboard/applypromotioncode/ApplyPromotionCode';
// import BerfinTest from './pages/landingpage/sections/BerfinTest';
import BerfinTest from './pages/landingpage/sections/BerfinTest';
import KlippersChatbot from './pages/mobileapp/KlippersChatbot';
import { SubtiterApp } from './subtiter.com';
import ListTrimmedVideosPage from './pages/ListTrimmedVideosPage';

// import TestPage from './pages/TestPage';



function App() {
  return (
      <Router>
        <Routes>
        {/* Public routes with OuterLayout */}
        <Route path="/" element={<OuterLayout />}>
          <Route index element={<LandingPage />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/payment" element={<Payment />} />
          <Route path="/create-account" element={<CreateAccountPage />} />
          {/* Add more public routes here as needed */}
        </Route>
        
        {/* Pricing and Payment pages with their own layouts */}
        
       
        <Route path="/login" element={<OuterLoginLayout />} >
          <Route index element={<LoginPage />} />   
        </Route>

        
        {/* <Route path="/halil-test" element={<OuterLayout />}>
          <Route index element={<TestPage />} />
        </Route> */}
        <Route path="/berfin-test" element={<OuterLayout />}>
          <Route index element={<BerfinTest />} />
        </Route>
        <Route path="/klippers-chatbot" element={<KlippersChatbot />} />
        <Route path="/subtiter" element={<SubtiterApp />} /> 

        {/* Protected routes with InnerLayout */}
        <Route path="/in" element={<InnerProtectedLayout />} >
          {/* <Route path="test" element={<TestPage />} /> */}
          <Route index path="dashboard" element={<Dashboard />} />
          <Route path="list-shorts/:videoid" element={<ListShortsPage />} />
          <Route path="list-subtitles/:videoid" element={<ListEmbeddedSubtitlesPage />} />
          <Route path="list-trim/:videoid" element={<ListTrimmedVideosPage />} />
          {/* <Route path="halil-dashboard" element={<HalilDashboard />} /> */}
          <Route path="account" element={<Account />} />
          {/* <Route path="usage" element={<Usage />} /> */}
          <Route path="billing" element={<Billing />} />
          <Route path="apply-promotion-code" element={<ApplyPromotionCode />} />
          <Route path="subscription" element={<ManageSubscription />} />
          <Route path="subscription/pay-for-upgrade" element={<PayForUpgrade />} />
          {/* Add more protected routes here as needed */}
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
