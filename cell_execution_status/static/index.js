

define([
    'base/js/namespace',
    'jquery',
    'require',
    'base/js/events',
    'base/js/dialog',
    'services/config',
    'base/js/utils',
    'notebook/js/codecell',
    'notebook/js/outputarea'
], function (Jupyter, $, require, events, jsdialog, configmod, utils, codecell, outputarea) {
    "use strict";

    var mod_name = 'CellExecutionStatus';
    var log_prefix = '[' + mod_name + ']';

    // defaults, overridden by server's config
    var options = {
        cell_executed_success_alert: false,
        cell_executed_error_alert: false,
        heartbeat: false,
        heartbeat_delay_in_s: 5,
        inform_error_cell_index: false, 
        all_run_alert: false, 
        all_run_alert_min: 5
    };

    var context = new AudioContext();
    var heartbeat = new AudioContext();
    var synth = window.speechSynthesis;
    var pulse = 1000 * options.heartbeat_delay_in_s;
    var o = null;
    var g = null;
    var running_cell_count = 0;
    var heartbeat_timer = '';
    var all_done_alert = false;
    
    //hearbeat: feedback_click('sine', 0.005)
    function feedback_click(type, duration_s) {
        o = heartbeat.createOscillator()
        g = heartbeat.createGain()
        o.connect(g)
        o.type = type
        g.connect(heartbeat.destination)
        o.start(0)
        g.gain.exponentialRampToValueAtTime(0.00001, heartbeat.currentTime + duration_s)
    }

    function heartbeat_pulse(){
        console.log('hb1',running_cell_count)
        if (running_cell_count<=0) return;
        console.log('tick...(cell running)');
        feedback_click('sine', 0.005);
        audio_pulse();
    }

    function audio_pulse(){
        console.log('pulse...')
        if (!(options.heartbeat)) return
        console.log('...pulse...')
        clearTimeout(heartbeat_timer);
        if (running_cell_count>0) {
            console.log('timer_running')
            heartbeat_timer = setTimeout(function () { heartbeat_pulse(); }, pulse);
        }
    }

    function feedback_tone(frequency, type) {
        o = context.createOscillator()
        g = context.createGain()
        o.type = type
        o.connect(g)
        o.frequency.value = frequency
        g.connect(context.destination)
        o.start(0)
        g.gain.exponentialRampToValueAtTime(0.00001, context.currentTime + 1)
    }

    function changeColor(first, cell, msg) {
        var outback = cell.output_area.wrapper.find('.out_prompt_bg');
        var inback = $(cell.input[0].firstChild);

        cell.element.removeClass('cell-status-success');
        cell.element.removeClass('cell-status-error');
        cell.element.removeClass('cell-status-inqueue');
        if (first == true) {
            cell.element.addClass('cell-status-inqueue');
            console.log('inq')
        } else {
            if (msg.content.status != "ok" && msg.content.status != "aborted") {
                cell.element.addClass('cell-status-error');
                if (options.heartbeat) {
                    running_cell_count = 0;
                    all_done_alert = false;
                    clearTimeout(heartbeat_timer);
                }
                if (options.cell_executed_error_alert) {
                    feedback_tone(220, 'sawtooth');
                }
                if (options.inform_error_cell_index) {
                    var say = new SpeechSynthesisUtterance('Broke on'+ msg.content.execution_count.toString());
                    synth.speak(say);
                }
                
            } else if (msg.content.status != "aborted") {
                cell.element.addClass('cell-status-success');
                running_cell_count = running_cell_count - 1;
                if (options.heartbeat) {
                    clearTimeout(heartbeat_timer);
                }
                if (options.cell_executed_success_alert) {
                    feedback_tone(440, 'triangle');
                }
                console.log(running_cell_count,all_done_alert )
                if ((running_cell_count<=0) && (all_done_alert)) {
                    all_done_alert = false;
                    var say = new SpeechSynthesisUtterance('All finished on'+ msg.content.execution_count.toString());
                    synth.speak(say);
                }
            }
        }
        audio_pulse();
    }


    function init_events() {
        events.on('create.Cell', function (e, data) {
            if (data.cell instanceof codecell.CodeCell) {
                setTimeout(function () {
                    extend_cell(data.cell);
                }, 0);
            }
        });
    }

    function extend_cell(cell) {
        extend_prompt(cell, cell.output_area);
    }

    function extend_prompt(cell, output_area) {
        $('<div/>')
            .addClass('out_prompt_bg')
            .addClass('prompt')
            .appendTo(output_area.wrapper);
    }

    /* Load additional CSS */
    var load_css = function (name) {
        var link = document.createElement("link");
        link.type = "text/css";
        link.rel = "stylesheet";
        link.href = require.toUrl(name, 'css');
        document.getElementsByTagName("head")[0].appendChild(link);
    };

    var load_extension = function () {
        load_css('./main.css');
    };

    function patch_CodeCell_get_callbacks() {
        console.log('[cell_execution_status] patching CodeCell.prototype.get_callbacks');
        var previous_get_callbacks = codecell.CodeCell.prototype.get_callbacks;

        codecell.CodeCell.prototype.get_callbacks = function () {
            running_cell_count = running_cell_count + 1;
            if ((options.all_run_alert) && (options.all_run_alert_min >= running_cell_count))
                all_done_alert = true;
            audio_pulse();

            var that = this;
            var callbacks = previous_get_callbacks.apply(this, arguments);
            var prev_iopub_output_callback = callbacks.iopub.output;
            callbacks.iopub.output = function (msg) {
                prev_iopub_output_callback(msg);
            }
            var prev_iopub_clear_output_callback = callbacks.iopub.clear_output;
            callbacks.iopub.clear_output = function (msg) {
                prev_iopub_clear_output_callback(msg);
            }
            return callbacks;
        };
    }
    function patch_CodeCell_clear_output() {
        console.log('[cell_execution_status] patching CodeCell.prototype.clear_output');
        var previous_clear_output = codecell.CodeCell.prototype.clear_output;
        codecell.CodeCell.prototype.clear_output = function(wait) {
            previous_clear_output.apply(this, arguments);
        }
    }
    function patch_CodeCell_handle_execute_reply() {
        console.log('[cell_execution_status] patching CodeCell.prototype._handle_execute_reply');
        var previous_handle_execute_reply = codecell.CodeCell.prototype._handle_execute_reply;
        codecell.CodeCell.prototype._handle_execute_reply = function (msg) {
            changeColor(false, this, msg);
            previous_handle_execute_reply.apply(this, arguments);
        };
    }

    function register_toolbar_buttons() {
        var buttons = [];

        Jupyter.toolbar.add_buttons_group(buttons);
    }

    var cell_execution_status = function () {  
        load_extension();
        register_toolbar_buttons();
        patch_CodeCell_get_callbacks();
        patch_CodeCell_clear_output();
        patch_CodeCell_handle_execute_reply();        

        var original_codecell_execute = codecell.CodeCell.prototype.execute;
        codecell.CodeCell.prototype.execute = function (stop_on_error) {
            // For Freeze extension
            if (!(this.metadata.run_through_control === undefined) && this.metadata.run_through_control.frozen) {
                console.log("Can't execute cell since cell is frozen.");
                return;
            }

            if (!this.kernel) {
                console.log("Can't execute cell since kernel is not set.");
                return;
            }

            if (stop_on_error === undefined) {
                stop_on_error = true;
            }

            this.clear_output(false, true);
            var old_msg_id = this.last_msg_id;
            if (old_msg_id) {
                this.kernel.clear_callbacks_for_msg(old_msg_id);
                delete codecell.CodeCell.msg_cells[old_msg_id];
                this.last_msg_id = null;
            }
            if (this.get_text().trim().length === 0) {
                // nothing to do
                this.set_input_prompt(null);
                return;
            }
            
            this.set_input_prompt('*');
            this.element.addClass("running");

            changeColor(true, this);

            var callbacks = this.get_callbacks();

            var options = {silent: false, store_history: true, stop_on_error: stop_on_error };

            this.last_msg_id = this.kernel.execute(this.get_text(), callbacks, options);
            codecell.CodeCell.msg_cells[this.last_msg_id] = this;
            this.render();
            this.events.trigger('execute.CodeCell', { cell: this });
        };

        /**
        * execute this extension on load
        */
        var on_notebook_loaded = function () {
            Jupyter.notebook.get_cells().forEach(function (cell, index, array) {
                if (cell instanceof codecell.CodeCell) {
                    extend_cell(cell);
                }
            });
            init_events();
        };

        Jupyter.notebook.config.loaded.then(function on_config_loaded() {
            $.extend(true, options, Jupyter.notebook.config.data[mod_name]);
            pulse = 1000 * options.heartbeat_delay_in_s; //in seconds
        }, function on_config_load_error(reason) {
            console.warn(log_prefix, 'Using defaults after error loading config:', reason);
        }).then(function do_stuff_with_config() {
            events.on("notebook_loaded.Notebook", on_notebook_loaded);
            if (Jupyter.notebook !== undefined && Jupyter.notebook._fully_loaded) {
                on_notebook_loaded();
            }
        }).catch(function on_error(reason) {
            console.error(log_prefix, 'Error:', reason);
        });
    };

    return {
        load_ipython_extension: cell_execution_status,
        load_jupyter_extension: cell_execution_status
    };
});
