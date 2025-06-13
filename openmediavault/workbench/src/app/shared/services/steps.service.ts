/**Home cloud changes new component**/
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { StepModel } from '../models/step.model';

const STEPS: StepModel[] = [
  { stepIndex: 1, isComplete: false, stepName:'Network Setup', isFirst: true },
  { stepIndex: 2, isComplete: false, stepName:'Wifi Setup', isFirst: false },
  { stepIndex: 3, isComplete: false, stepName:'Tailscale Setup', isFirst: false },
  { stepIndex: 4, isComplete: false, stepName:'Change Password', isFirst: false },
  { stepIndex: 5, isComplete: false, stepName:'OneDrive Setup', isFirst: false },
  { stepIndex: 6, isComplete: false, stepName:'Add additional users', isFirst: false },
  { stepIndex: 7, isComplete: false, stepName:'Date Time Settings', isFirst: false },
  { stepIndex: 8, isComplete: false, stepName:'Notification Settings', isFirst: false }


];

@Injectable({
  providedIn: 'root'
})
export class StepsService {
  stepsSubject: BehaviorSubject<StepModel[]> = new BehaviorSubject<StepModel[]>(STEPS);
  currentStep$: BehaviorSubject<StepModel | null> = new BehaviorSubject<StepModel | null>(null);

  constructor() {
    // Initialize the current step to the first step if available
    this.currentStep$.next(this.stepsSubject.value[0] || null);
  }

  setCurrentStep(step: StepModel): void {
    this.currentStep$.next(step);
  }

  getCurrentStep(): Observable<StepModel | null> {
    return this.currentStep$.asObservable();
  }
  getCurrentStepName(): string {
    return this.currentStep$.value.stepName;
  }


  getSteps() {
    return this.stepsSubject.asObservable();
  }

  moveToNextStep(): void {
    const currentStep = this.currentStep$.value;

    if (currentStep) {
      const index = currentStep.stepIndex;

      // Check if we can move to the next step
      if(index == 1){
        this.currentStep$.next(this.stepsSubject.value[index+1]);
      }
      else{
        if (index < this.stepsSubject.value.length) {
          this.currentStep$.next(this.stepsSubject.value[index]); // This might need to be index + 1
        }
      }

    }
  }

  isLastStep(): boolean {
    const currentStep = this.currentStep$.value;
    return currentStep ? currentStep.stepIndex === this.stepsSubject.value.length : false;
  }
  moveToPreviousStep(): void {
    const currentStep = this.currentStep$.value;

    if (currentStep) {
      const index = currentStep.stepIndex; // This is 1-based

      // Check if we can move to the previous step
      if (index > 1) {
        // Move to the previous step
        this.currentStep$.next(this.stepsSubject.value[index - 2]); // Adjust for zero-based index
      }
    }
  }


  isFirstStep(): boolean {
    const currentStep = this.currentStep$.value;
    return currentStep ? currentStep.stepIndex === 1 : false;
  }

  // Update the steps and emit the new value
  updateSteps(steps: StepModel[]) {
    this.stepsSubject.next(steps);
  }
  // Update the current step and emit the new value
  updateCurrentStep(step: StepModel) {
    this.currentStep$.next(step);
  }
}
