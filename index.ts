class Picker {
    public static readonly FORMAT: RegExp = /^(\d{4})-(\d{1,2})-(\d{1,2}) (\d{1,2}):(\d{1,2})$/;
    public static parse(str: string): Date {
        const match: RegExpMatchArray | null = str.match(Picker.FORMAT);
        if (!match) {
            throw new TypeError("Wrong Format!");
        }
        const result: Date = new Date(+match[1], +match[2] - 1, +match[3], +match[4], +match[5]);
        return result;
    }
    protected css: string = ".picker_root_container{position:absolute;width:12em;z-index:-999;top:-999px;left:10px;opacity:0;transition:opacity .13s ease-in-out;padding:.5rem 1rem 1rem;border:1px solid #a2a9b1;box-shadow:0 1px 1px 0 rgba(0,0,0,.1);background-color:white}.picker_root_container ::-webkit-inner-spin-button{display:none}.picker_date_year_selector{display:flex;justify-content:space-between}.picker_root_container input{border-width:0 0 1px 0;border-color:rgba(0,0,255,.3);text-align:center}#picker_date_year_editor{width:4em}.picker_date_month_selector,.picker_confirm{display:flex;justify-content:space-around}#picker_date_month_editor{width:2em}#picker_time_hour_editor{margin-right:.5em}#picker_time_hour_editor,#picker_time_minute_editor{width:3em}#picker_date_year_prev,#picker_date_year_next,#picker_date_month_prev,#picker_date_month_next{color:rgba(0,0,255,.5);cursor:pointer;user-select:none;border:1px rgba(0,0,0,0) solid;width:1.5em;border-radius:1.5em;text-align:center;transition:all .37s ease-in-out}#picker_date_year_prev:hover,#picker_date_year_next:hover,#picker_date_month_prev:hover,#picker_date_month_next:hover{border-color:rgba(0,0,0,.37)}#picker_date_day_selector{border-collapse:separate}#picker_date_day_selector th{font-weight:normal;user-select:none}#picker_date_day_selector td{cursor:pointer;text-align:center}#picker_date_day_selector td:empty{border-bottom-color:transparent}#picker_date_day_selector td:empty:after{content:" ";display:block;height:1rem}#picker_date_day_selected{border:1px rgba(0,0,255,.3) solid !important}#picker_date_day_selector th,#picker_date_day_selector td{border-color:transparent transparent gray transparent}.picker_time_container{text-align:center;margin:.5rem 0}#picker_submit,#picker_cancel{border:1px #a2a9b1 solid;cursor:pointer;padding:0 1rem;background-color:#f8f9fa}"
    protected picker: JQuery<HTMLElement> = $(`<div class="picker_root_container"><div class="picker_date_container"><div class="picker_date_year_selector"><div id="picker_date_year_prev">&lt;</div><div id="picker_date_year"> <input type="number" id="picker_date_year_editor" min="1" max="9999"></div><div id="picker_date_year_next">&gt;</div></div><div class="picker_date_month_selector"><div id="picker_date_month_prev">&lt;</div><div id="picker_date_month"> <input type="number" id="picker_date_month_editor" min="1" max="12"></div><div id="picker_date_month_next">&gt;</div></div><table id="picker_date_day_selector"><thead><tr><th>日</th><th>一</th><th>二</th><th>三</th><th>四</th><th>五</th><th>六</th></tr></thead><tbody>${`<tr><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>`.repeat(6)}</tbody></table></div><div class="picker_time_container"> <input type="number" id="picker_time_hour_editor" min="0" max="23"> <span class="picker_time_separator">：</span> <input type="number" id="picker_time_minute_editor" min="0" max="59"></div><div class="picker_confirm"><div id="picker_submit">确认</div><div id="picker_cancel">取消</div></div></div>`);
    protected yearEditor: JQuery<HTMLElement> = this.picker.find("#picker_date_year_editor");
    protected monthEditor: JQuery<HTMLElement> = this.picker.find("#picker_date_month_editor");
    protected daySelector: JQuery<HTMLTableElement> = this.picker.find("#picker_date_day_selector") as JQuery<HTMLTableElement>;
    protected hourEditor: JQuery<HTMLElement> = this.picker.find("#picker_time_hour_editor");
    protected minuteEditor: JQuery<HTMLElement> = this.picker.find("#picker_time_minute_editor");
    protected originInput: JQuery<HTMLElement> | undefined;
    constructor() {
        const cssNode: JQuery<HTMLElement> = $("<style/>");
        cssNode.text(this.css);
        $("head").append(cssNode);
        $("body").append(this.picker);
        $("#picker_date_year_prev").on("click", (): void => {
            this.subtractYear();
        });
        $("#picker_date_year_next").on("click", (): void => {
            this.addYear();
        });
        $("#picker_date_month_prev").on("click", (): void => {
            this.subtractMonth();
        });
        $("#picker_date_month_next").on("click", (): void => {
            this.addMonth();
        });
        $("#picker_date_day_selector").on("click",
            (e: JQuery.ClickEvent<HTMLElement, undefined, HTMLElement, HTMLElement>): void => {
                const target: JQuery<HTMLElement> = $(e.target);
                if (target.is("td")) {
                    $("#picker_date_day_selected").removeAttr("id");
                    target.attr("id", "picker_date_day_selected");
                }
            },
        );
        this.picker.find("input").on("keydown",
            (e: JQuery.KeyDownEvent<HTMLElement, undefined, HTMLElement, HTMLElement>): boolean => {
                if (!/^\d+$|^Delete$|^Backspace$/.test(e.key || "")) {
                    return false;
                } else {
                    this.generateDaySelectorTable();
                    return true;
                }
            },
        );
        $("#picker_submit").on("click", (): void => {
            if (this.originInput) {
                this.originInput.val(
                    this.yearEditor.val() + "-" +
                    this.fixNumber(this.monthEditor.val() as string) + "-" +
                    this.fixNumber($("#picker_date_day_selected").text()) + " " +
                    this.fixNumber(this.hourEditor.val() as string) + ":" +
                    this.fixNumber(this.minuteEditor.val() as string),
                );
                this.originInput.change();
            }
            $("#picker_cancel").click();
        });
        $("#picker_cancel").on("click", (): void => {
            this.originInput = undefined;
            this.picker.css("opacity", "0").delay(130).queue((): void => {
                this.picker.css({
                    left: "10px",
                    top: "-999px",
                    "z-index": "-999",
                });
                this.picker.dequeue();
            });
        });
    }
    public connectInput(input: JQuery<HTMLElement>): this {
        const now: Date = new Date();
        let parseResult: RegExpMatchArray | number[] | null = (input.val() as string).match(Picker.FORMAT);
        if (!parseResult) {
            parseResult = [now.getFullYear(), now.getMonth() + 1, now.getDate(), now.getHours(), now.getMinutes()];
        } else {
            parseResult = Array.from(parseResult).slice(1).map((n: string, i: number) => {
                let mixed: number[] = [];
                switch (i) {
                    case 0:
                        mixed = [1, 9999, +n];
                        break;
                    case 1:
                        mixed = [1, 12, +n];
                        break;
                    case 2:
                        mixed = [1, 31, +n];
                        break;
                    case 3:
                        mixed = [0, 23, +n];
                        break;
                    case 4:
                        mixed = [0, 59, +n];
                        break;
                }
                mixed.sort((a: number, b: number): number => a - b);
                return mixed[1];
            });
        }
        this.yearEditor.val(parseResult[0]);
        this.monthEditor.val(parseResult[1]);
        this.hourEditor.val(parseResult[3]);
        this.minuteEditor.val(parseResult[4]);
        this.generateDaySelectorTable();
        this.daySelector.find(`[data-day="${parseResult[2]}"]`).click();
        let {
            top,
            left,
        }: JQuery.Coordinates = input.offset() as JQuery.Coordinates;
        left -= ((this.picker.outerWidth() as number) - (input.outerWidth() as number)) / 2;
        const topArray: number[] = [10, top,
            ($(document).height() as number)
            - (this.picker.outerHeight() as number) - 10 - (input.outerHeight() as number)];
        const leftArray: number[] = [10, left,
            ($(document).width() as number) - (this.picker.outerWidth() as number) - 10];
        topArray.sort((a: number, b: number): number => a - b);
        leftArray.sort((a: number, b: number): number => a - b);
        top = topArray[1] + (input.outerHeight() as number);
        left = leftArray[1];
        this.picker.css({
            left,
            opacity: "1",
            top,
            "z-index": "999",
        });
        this.originInput = input;
        return this;
    }
    protected addYear(): void {
        const year: number = +(this.yearEditor.val() as string);
        if (year < 9999) {
            this.yearEditor.val(year + 1);
            this.generateDaySelectorTable();
        }
    }
    protected subtractYear(): void {
        const year: number = +(this.yearEditor.val() as string);
        if (year > 1) {
            this.yearEditor.val(year - 1);
            this.generateDaySelectorTable();
        }
    }
    protected addMonth(): void {
        const year: number = +(this.yearEditor.val() as string);
        const month: number = +(this.monthEditor.val() as string);
        if (month < 12) {
            this.monthEditor.val(month + 1);
            this.generateDaySelectorTable();
        } else if (year < 9999) {
            this.monthEditor.val(1);
            this.yearEditor.val(year + 1);
            this.generateDaySelectorTable();
        }
    }
    protected subtractMonth(): void {
        const year: number = +(this.yearEditor.val() as string);
        const month: number = +(this.monthEditor.val() as string);
        if (month > 1) {
            this.monthEditor.val(month - 1);
            this.generateDaySelectorTable();
        } else if (year > 1) {
            this.monthEditor.val(12);
            this.yearEditor.val(year - 1);
            this.generateDaySelectorTable();
        }
    }
    protected generateDaySelectorTable(): void {
        let backupDaySelected: number = +$("#picker_date_day_selected").text();
        const year: number = +(this.yearEditor.val() as string);
        const month: number = +(this.monthEditor.val() as string);
        const firstDate: Date = new Date(year, month - 1, 1);
        let lastDay: number;
        if (month === 2) {
            if (year % 4 === 0) {
                lastDay = 29;
            } else {
                lastDay = 28;
            }
        } else if ([1, 3, 5, 7, 8, 10, 12].includes(month)) {
            lastDay = 31;
        } else {
            lastDay = 30;
        }
        if (backupDaySelected > lastDay) {
            backupDaySelected = lastDay;
        }
        $("#picker_date_day_selected").removeAttr("id");
        for (let d: number = -firstDate.getDay() + 1, i: number = 0; i < 42; d++ , i++) {
            const target: JQuery<HTMLElement> = this.daySelector
                .find("tbody tr").eq(Math.floor(i / 7))
                .find("td").eq(i % 7);
            if (d < 1 || d > lastDay) {
                target.attr("data-day", "").text("");
                continue;
            }
            target.attr("data-day", d).text(d);
            if (d === backupDaySelected) {
                target.attr("id", "picker_date_day_selected");
            }
        }
        this.daySelector.find("tbody tr").each((_: number, ele: HTMLElement): void => {
            if (/\d/.test($(ele).text())) {
                $(ele).show();
            } else {
                $(ele).hide();
            }
        });
    }
    protected fixNumber(n: number | string): string {
        if (+n < 10) {
            return "0" + n;
        } else {
            return "" + n;
        }
    }
}
