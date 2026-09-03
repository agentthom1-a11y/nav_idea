import React, { useState, useEffect } from 'react';
import { Joyride, CallBackProps, STATUS, Step } from 'react-joyride';

export const FeatureTour: React.FC = () => {
  const [run, setRun] = useState(false);

  useEffect(() => {
    // Check if the user has already taken the tour
    const hasSeenTour = localStorage.getItem('navrine_tour_completed');
    if (!hasSeenTour) {
      // Delay slightly so UI loads before tour starts
      const timer = setTimeout(() => setRun(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const steps: Step[] = [
    {
      target: 'body',
      content: 'Welcome to NAVRINE IDEA! Let\'s take a quick tour of the features to get you started.',
      placement: 'center',
      disableBeacon: true,
    },
    {
      target: '#tour-sidebar-nav',
      content: 'Here is your main navigation. Quickly jump between Dashboard, Planner, Content, Ideas, and Analytics.',
      placement: 'right',
    },
    {
      target: '#tour-global-search',
      content: 'Use the Global Search (or hit Ctrl+K) to instantly find content, ideas, campaigns, or settings anywhere.',
      placement: 'bottom',
    },
    {
      target: '#tour-create-btn',
      content: 'Ready to write? Click Create to start a new content piece instantly.',
      placement: 'bottom',
    },
    {
      target: '#tour-user-profile',
      content: 'Manage your profile and application settings here.',
      placement: 'right',
    }
  ];

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status } = data;
    const finishedStatuses: string[] = [STATUS.FINISHED, STATUS.SKIPPED];

    if (finishedStatuses.includes(status)) {
      setRun(false);
      localStorage.setItem('navrine_tour_completed', 'true');
    }
  };

  return (
    <Joyride
      callback={handleJoyrideCallback}
      continuous
      hideCloseButton
      run={run}
      scrollToFirstStep
      showProgress
      showSkipButton
      steps={steps}
      styles={{
        options: {
          zIndex: 10000,
          primaryColor: '#2563eb', // blue-600
          textColor: '#0f172a', // slate-900
          backgroundColor: '#ffffff',
          overlayColor: 'rgba(0, 0, 0, 0.5)',
        },
        tooltipContainer: {
          textAlign: 'left',
          borderRadius: '12px',
        },
        buttonNext: {
          borderRadius: '6px',
          fontWeight: 600,
        },
        buttonBack: {
          marginRight: 10,
        },
        buttonSkip: {
          color: '#64748b', // slate-500
        }
      }}
    />
  );
};
