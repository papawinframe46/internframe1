import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CrudprojectngComponent } from './crudprojectng.component';

describe('CrudprojectngComponent', () => {
  let component: CrudprojectngComponent;
  let fixture: ComponentFixture<CrudprojectngComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CrudprojectngComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CrudprojectngComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
