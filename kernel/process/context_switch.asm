global switch_task

; void switch_task(uint32_t *prev_esp, uint32_t next_esp);
switch_task:
    ; Push callee-saved registers onto current process stack
    push ebp
    push edi
    push esi
    push ebx

    ; Save current ESP into prev_esp
    ; C calling convention: first arg is at [esp + 20] (4 pushes * 4 bytes + return address)
    mov eax, [esp + 20] 
    mov [eax], esp

    ; Load next_esp into ESP
    ; C calling convention: second arg is at [esp + 24]
    mov eax, [esp + 24]
    mov esp, eax

    ; Pop callee-saved registers from the new process stack
    pop ebx
    pop esi
    pop edi
    pop ebp

    ; Return to the newly loaded process!
    ret
