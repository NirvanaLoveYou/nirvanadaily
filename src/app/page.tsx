"use client";

import { JournalProvider, useJournal } from "@/lib/journal-context";
import CalendarView from "@/components/journal/CalendarView";
import DayDetailView from "@/components/journal/DayDetailView";
import TasksMenu from "@/components/journal/TasksMenu";
import QuickLogView from "@/components/journal/QuickLogView";
import StatsView from "@/components/journal/StatsView";
import UserView from "@/components/journal/UserView";
import Header from "@/components/journal/Header";
import BottomPanel from "@/components/journal/BottomPanel";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sparkles, Bell, Check } from "lucide-react";
import { useEffect, useState } from "react";
import { requestNotificationPermission } from "@/lib/notifications";

// --- ONBOARDING STEPS ---
type OnboardingStep = 'welcome' | 'notifications';

function AppContent() {
  const { tabMode, viewMode, hasOnboarded, setHasOnboarded, currentDate, data, theme } = useJournal();

  // Onboarding State
  const [onboardingStep, setOnboardingStep] = useState<OnboardingStep>('welcome');

  // --- ONBOARDING LOGIC ---

  const handleNextStep = (step: OnboardingStep) => {
    setOnboardingStep(step);
  };

  const handleNotificationRequest = async () => {
    await requestNotificationPermission();
    finishOnboarding();
  };

  const finishOnboarding = () => {
    setHasOnboarded(true);
    setOnboardingStep('welcome');
  };

  return (
    <div className={`min-h-screen font-sans flex justify-center overflow-hidden transition-colors duration-300 ${
      theme === 'dark' 
        ? 'bg-slate-950' 
        : theme === 'purple' 
        ? 'bg-purple-50' 
        : theme === 'nature' 
        ? 'bg-[#F2F0E9]' // Matte Nature Background
        : 'bg-[#FAF9F6]'
    }`}>
      {/* Mobile-like Container */}
      <div className={`w-full max-w-[480px] h-screen flex flex-col relative border-x transition-colors duration-300 shadow-2xl ${
        theme === 'dark' 
          ? 'bg-slate-900 border-slate-800 text-slate-100' 
          : theme === 'purple'
          ? 'bg-white border-purple-200 text-purple-900'
          : theme === 'nature'
          ? 'bg-[#E9E6DB] border-[#D3CCC0] text-[#2C362F]' // Matte Nature Container
          : 'bg-[#FAF9F6] border-black/5 text-[#4A403A]'
      }`}>
        
        <Header />

        <main className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar pb-20 relative">
          {tabMode === 'journal' && (
            <div className="absolute inset-0 overflow-y-auto overflow-x-hidden custom-scrollbar">
              {viewMode === 'day' ? <DayDetailView /> : <CalendarView />}
            </div>
          )}
          
          {tabMode === 'tasks' && (
            <div className="absolute inset-0 overflow-y-auto overflow-x-hidden custom-scrollbar">
              <TasksMenu />
            </div>
          )}

          {tabMode === 'log' && (
            <div className="absolute inset-0 overflow-y-auto overflow-x-hidden custom-scrollbar">
              <QuickLogView />
            </div>
          )}

          {tabMode === 'stats' && (
            <div className="absolute inset-0 overflow-y-auto overflow-x-hidden custom-scrollbar">
              <StatsView />
            </div>
          )}

          {tabMode === 'user' && (
            <div className="absolute inset-0 overflow-y-auto overflow-x-hidden custom-scrollbar">
              <UserView />
            </div>
          )}
        </main>

        <BottomPanel />

        {/* --- ONBOARDING WIZARD --- */}
        <Dialog open={!hasOnboarded}>
          <DialogContent className={`border-none shadow-2xl max-w-sm ${
            theme === 'dark' 
              ? 'bg-slate-900 text-slate-100 border-slate-800' 
              : theme === 'purple'
              ? 'bg-purple-50 text-purple-900 border-purple-200'
              : theme === 'nature'
              ? 'bg-[#E9E6DB] text-[#2C362F] border-[#D3CCC0]' // Matte Nature Dialog
              : 'bg-white text-[#4A403A]'
          }`}>
            <DialogHeader>
              <div className="flex flex-col items-center text-center space-y-2">
                <div className={`p-3 rounded-full ${theme === 'dark' ? 'bg-slate-800' : theme === 'purple' ? 'bg-white' : theme === 'nature' ? 'bg-[#E9E6DB]' : 'bg-[#E8A87C]/10'}`}>
                  <Sparkles className={`w-8 h-8 ${theme === 'purple' ? 'text-[#c084fc]' : theme === 'dark' ? 'text-[#94a3b8]' : theme === 'nature' ? 'text-[#3E4E3C]' : 'text-[#E8A87C]'}`} />
                </div>
                <DialogTitle className="text-xl font-bold">
                  {onboardingStep === 'welcome' && 'Добро пожаловать'}
                  {onboardingStep === 'notifications' && 'Уведомления'}
                </DialogTitle>
                <DialogDescription className={`text-sm max-w-[250px] ${theme === 'dark' ? 'text-slate-400' : theme === 'purple' ? 'text-purple-400' : theme === 'nature' ? 'text-[#5F6A63]' : 'text-gray-500'}`}>
                  {onboardingStep === 'welcome' && (
                    <>Это <strong>NirvanaDaily</strong> — ваше личное пространство.<br/>Данные хранятся только на этом устройстве.</>
                  )}
                  {onboardingStep === 'notifications' && (
                    <>Получайте напоминания о задачах в нужное время.</>
                  )}
                </DialogDescription>
              </div>
            </DialogHeader>

            <div className="py-4">
              {/* STEP 1: WELCOME */}
              {onboardingStep === 'welcome' && (
                <div className="flex flex-col gap-3">
                  <Button 
                    onClick={() => handleNextStep('notifications')}
                    className="w-full h-12 text-base font-medium bg-[#E8A87C] hover:bg-[#d49a6d] text-white shadow-lg shadow-[#E8A87C]/20"
                  >
                    Начать настройку
                  </Button>
                  <Button 
                    onClick={finishOnboarding}
                    variant="ghost"
                    className="w-full h-10 text-sm text-gray-400 hover:text-gray-600"
                  >
                    Пропустить
                  </Button>
                </div>
              )}

              {/* STEP 2: NOTIFICATIONS */}
              {onboardingStep === 'notifications' && (
                <div className="flex flex-col gap-3">
                  <Button 
                    onClick={handleNotificationRequest}
                    className={`w-full h-12 text-base font-medium text-white shadow-lg ${
                      theme === 'purple' ? 'bg-[#c084fc] hover:bg-[#b074e8] shadow-[#c084fc]/20' : 
                      theme === 'dark' ? 'bg-[#94a3b8] hover:bg-[#a5b4c9] shadow-[#94a3b8]/20' : 
                      'bg-[#E8A87C] hover:bg-[#d49a6d] shadow-[#E8A87C]/20'
                    }`}
                  >
                    <Bell className="w-5 h-5 mr-2" /> Разрешить уведомления
                  </Button>
                  <Button 
                    onClick={finishOnboarding}
                    variant="ghost"
                    className="w-full h-10 text-sm text-gray-400 hover:text-gray-600"
                  >
                    Не сейчас
                  </Button>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <JournalProvider>
      <AppContent />
    </JournalProvider>
  );
}