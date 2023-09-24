import { Component } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { QuizService } from 'src/app/services/quiz.service';

@Component({
  selector: 'app-quiz',
  templateUrl: './quiz.component.html',
  styleUrls: ['./quiz.component.scss']
})
export class QuizComponent {
  protected checked: boolean = false;
  protected form: FormGroup = new FormGroup({});
  protected quizName: string = "";
  protected currentQuestionIndex: number = 0;
  protected questions: Question[] = [];
  protected showReport: boolean = false;

  constructor(
    route: ActivatedRoute,
    quizService: QuizService,
  ) {
    route.params.subscribe(params => {
      quizService.getQuiz(params["id"]).subscribe({
        next: quiz => {
          if (quiz == null) return;

          this.quizName = quiz!.name;

          for (let row of quiz?.data) {
            let question = new Question();
            question.questionFields = [new QuestionField(quiz.fields[0].name, row[quiz.fields[0].name])];
            let control = new FormControl();
            control.disable();
            this.form.addControl(quiz.fields[0].name, control);
            for (let i = 1; i < quiz.fields.length; i++) {
              question.answerFields.push(new AnswerField(quiz.fields[i].name, row[quiz.fields[i].name]));
              this.form.addControl(quiz.fields[i].name, new FormControl());
            }

            this.questions.push(question);
          }

          this.setQuestion(0);
        },
        error: err => console.error(err)
      });
    });
  }

  protected shuffleQuestions() {
    this.questions = this.questions.sort(() => Math.random() - 0.5);
    this.setQuestion(0);
  }

  protected onSubmit() {
    if (this.checked) {
      this.currentQuestionIndex++;
      if (this.currentQuestionIndex >= this.questions.length) {
        this.showReport = true;
        return;
      }
      this.setQuestion(this.currentQuestionIndex);

    } else {
      let value = this.form.getRawValue();
      let question = this.questions[this.currentQuestionIndex];

      let correctAnswerGiven = true;

      for (let field of question.answerFields) {
        field.userValue = value[field.name];
        if (field.value != field.userValue) {
          correctAnswerGiven = false;
        }
      }

      question.correctAnswerGiven = correctAnswerGiven;
    }

    this.checked = !this.checked;
  }

  private setQuestion(idx: number) {
    let question = this.questions[idx];
    this.form.reset();

    for (let field of question.questionFields) {
      this.form.controls[field.name].setValue(field.value);
    }

    var element = document.getElementById("field-"+question.answerFields[0].name);
    console.log(element);
  }
}

class Question {
  public correctAnswerGiven: boolean | null = null;
  public questionFields: QuestionField[] = [];
  public answerFields: AnswerField[] = [];
}

class QuestionField {
  constructor(name: string, value: any) {
    this.name = name;
    this.value = value;
  }

  public name: string
  public value: any;
}

class AnswerField {
  constructor(name: string, value: any) {
    this.name = name;
    this.value = value;
  }

  public name: string
  public value: any;
  public userValue: any;
}

