package com.calendar.event_service;

import graphql.schema.Coercing;
import graphql.schema.CoercingParseLiteralException;
import graphql.schema.CoercingParseValueException;
import graphql.schema.CoercingSerializeException;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

public class DateTimeCoercing implements Coercing<LocalDateTime, String> {
    private final DateTimeFormatter formatter = DateTimeFormatter.ISO_LOCAL_DATE_TIME;

    @Override
    public String serialize(Object dataFetcherResult) {
        if (dataFetcherResult instanceof LocalDateTime) {
            return ((LocalDateTime) dataFetcherResult).format(formatter);
        }
        throw new CoercingSerializeException("Invalid value for DateTime");
    }

    @Override
    public LocalDateTime parseValue(Object input) {
        try {
            return LocalDateTime.parse(input.toString(), formatter);
        } catch (Exception e) {
            throw new CoercingParseValueException("Invalid value for DateTime");
        }
    }

    @Override
    public LocalDateTime parseLiteral(Object input) {
        try {
            return LocalDateTime.parse(input.toString(), formatter);
        } catch (Exception e) {
            throw new CoercingParseLiteralException("Invalid literal for DateTime");
        }
    }
}
