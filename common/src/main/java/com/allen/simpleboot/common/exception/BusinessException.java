package com.allen.simpleboot.common.exception;

/** A user-facing business error. Do not put internal or sensitive details here. */
public class BusinessException extends RuntimeException {
    public BusinessException(String message) {
        super(message);
    }
}
